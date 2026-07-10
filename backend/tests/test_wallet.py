"""Wallet Engine tests (Prompt 30).

Covers: wallet creation, balance retrieval, credit/debit operations,
ledger entries, history retrieval, pagination, validation errors,
unauthorized access, atomic rollback.
"""
from __future__ import annotations


class TestWalletRetrieval:
    """Wallet retrieval tests."""

    def test_get_wallet_unauthorized(self, client):
        resp = client.get("/api/v1/wallet")
        assert resp.status_code == 401

    def test_get_wallet_authorized(self, client, auth_headers):
        resp = client.get("/api/v1/wallet", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "current_balance" in data

    def test_get_summary(self, client, auth_headers):
        resp = client.get("/api/v1/wallet/summary", headers=auth_headers)
        assert resp.status_code == 200


class TestWalletOperations:
    """Credit/debit and ledger entry tests."""

    def test_credit_coins(self, app, test_user):
        from services.wallet_service import WalletService

        with app.app_context():
            wallet = WalletService.credit_coins(
                user_id=test_user["user_id"],
                amount=100,
                transaction_type="reward_credit",
                reference="test-reward-001",
                description="Test reward credit",
            )
            assert wallet["current_balance"] == 100

    def test_debit_coins(self, app, test_user):
        from services.wallet_service import WalletService

        with app.app_context():
            WalletService.credit_coins(
                user_id=test_user["user_id"],
                amount=200,
                transaction_type="reward_credit",
                reference="test-credit-001",
                description="Setup credit",
            )
            wallet = WalletService.debit_coins(
                user_id=test_user["user_id"],
                amount=50,
                transaction_type="redeem_debit",
                reference="test-redeem-001",
                description="Test redeem debit",
            )
            assert wallet["current_balance"] == 150

    def test_debit_insufficient_balance(self, app, test_user):
        from services.wallet_service import WalletService
        from core.exceptions import BusinessError

        with app.app_context():
            try:
                WalletService.debit_coins(
                    user_id=test_user["user_id"],
                    amount=10000,
                    transaction_type="redeem_debit",
                    reference="test-fail-001",
                    description="Should fail",
                )
                assert False, "Should have raised BusinessError"
            except BusinessError:
                assert True

    def test_credit_creates_ledger_entry(self, app, test_user):
        from services.wallet_service import WalletService
        from services.transaction_service import TransactionService

        with app.app_context():
            WalletService.credit_coins(
                user_id=test_user["user_id"],
                amount=100,
                transaction_type="reward_credit",
                reference="ledger-test-001",
                description="Ledger test",
            )
            history = TransactionService.get_history(
                user_id=test_user["user_id"],
                page=1,
                page_size=10,
                filters={},
            )
            assert history["total"] >= 1
            txn = history["items"][0]
            assert txn["previous_balance"] == 0
            assert txn["new_balance"] == 100

    def test_atomic_rollback(self, app, test_user):
        """If a debit fails (insufficient balance), balance must not change."""
        from services.wallet_service import WalletService
        from core.exceptions import BusinessError

        with app.app_context():
            WalletService.credit_coins(
                user_id=test_user["user_id"],
                amount=50,
                transaction_type="reward_credit",
                reference="setup-001",
                description="Setup",
            )
            try:
                WalletService.debit_coins(
                    user_id=test_user["user_id"],
                    amount=100,
                    transaction_type="redeem_debit",
                    reference="fail-001",
                    description="Should fail",
                )
            except BusinessError:
                pass

            wallet = WalletService.get_or_create_wallet(test_user["user_id"])
            assert wallet.current_balance == 50


class TestWalletHistory:
    """History and pagination tests."""

    def test_history_pagination(self, app, test_user):
        from services.wallet_service import WalletService
        from services.transaction_service import TransactionService

        with app.app_context():
            for i in range(5):
                WalletService.credit_coins(
                    user_id=test_user["user_id"],
                    amount=10,
                    transaction_type="reward_credit",
                    reference=f"page-test-{i}",
                    description=f"Credit {i}",
                )
            result = TransactionService.get_history(
                user_id=test_user["user_id"],
                page=1,
                page_size=2,
                filters={},
            )
            assert len(result["items"]) == 2
            assert result["total"] >= 5

    def test_history_unauthorized(self, client):
        resp = client.get("/api/v1/wallet/history")
        assert resp.status_code == 401


class TestWalletValidation:
    """Financial validation tests."""

    def test_negative_amount_rejected(self, app, test_user):
        from services.wallet_service import WalletService
        from core.exceptions import ValidationError

        with app.app_context():
            try:
                WalletService.credit_coins(
                    user_id=test_user["user_id"],
                    amount=-50,
                    transaction_type="reward_credit",
                    reference="neg-001",
                    description="Negative test",
                )
                assert False, "Should raise ValidationError"
            except (ValidationError, ValueError):
                assert True

    def test_zero_amount_rejected(self, app, test_user):
        from services.wallet_service import WalletService
        from core.exceptions import ValidationError

        with app.app_context():
            try:
                WalletService.credit_coins(
                    user_id=test_user["user_id"],
                    amount=0,
                    transaction_type="reward_credit",
                    reference="zero-001",
                    description="Zero test",
                )
                assert False, "Should raise ValidationError"
            except (ValidationError, ValueError):
                assert True
