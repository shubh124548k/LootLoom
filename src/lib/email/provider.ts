export type EmailProviderType = "smtp" | "resend" | "sendgrid" | "ses";

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailAddress;
  replyTo?: EmailAddress;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  readonly name: string;
  send(options: SendEmailOptions): Promise<SendEmailResult>;
  isConfigured(): boolean;
}

export class SmtpProvider implements IEmailProvider {
  readonly name = "smtp";
  private config: { host: string; port: number; user: string; pass: string; from: string } | null = null;

  configure(host: string, port: number, user: string, pass: string, from: string): void {
    this.config = { host, port, user, pass, from };
  }

  isConfigured(): boolean {
    return !!this.config && !!this.config.host && !!this.config.user;
  }

  async send(_options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "SMTP not configured" };
    }
    return { success: true, messageId: `smtp-${Date.now()}` };
  }
}

export class ResendProvider implements IEmailProvider {
  readonly name = "resend";
  private apiKey: string | null = null;

  configure(apiKey: string): void {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async send(_options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "Resend not configured" };
    }
    return { success: true, messageId: `resend-${Date.now()}` };
  }
}

export class SendGridProvider implements IEmailProvider {
  readonly name = "sendgrid";
  private apiKey: string | null = null;

  configure(apiKey: string): void {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async send(_options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "SendGrid not configured" };
    }
    return { success: true, messageId: `sg-${Date.now()}` };
  }
}

export class SesProvider implements IEmailProvider {
  readonly name = "ses";
  private config: { region: string; accessKey: string; secretKey: string } | null = null;

  configure(region: string, accessKey: string, secretKey: string): void {
    this.config = { region, accessKey, secretKey };
  }

  isConfigured(): boolean {
    return !!this.config && !!this.config.region;
  }

  async send(_options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "SES not configured" };
    }
    return { success: true, messageId: `ses-${Date.now()}` };
  }
}

export class NullEmailProvider implements IEmailProvider {
  readonly name = "null";

  isConfigured(): boolean {
    return true;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const to = Array.isArray(options.to) ? options.to.map((t) => t.address).join(", ") : options.to.address;
    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

let currentEmailProvider: IEmailProvider = new NullEmailProvider();

export function getEmailProvider(): IEmailProvider {
  return currentEmailProvider;
}

export function setEmailProvider(provider: IEmailProvider): void {
  currentEmailProvider = provider;
}

export function createEmailProvider(type: EmailProviderType, config: Record<string, string>): IEmailProvider {
  switch (type) {
    case "smtp":
      const smtp = new SmtpProvider();
      smtp.configure(config.host || "", parseInt(config.port || "587"), config.user || "", config.pass || "", config.from || "");
      return smtp;
    case "resend":
      const resend = new ResendProvider();
      resend.configure(config.apiKey || "");
      return resend;
    case "sendgrid":
      const sg = new SendGridProvider();
      sg.configure(config.apiKey || "");
      return sg;
    case "ses":
      const ses = new SesProvider();
      ses.configure(config.region || "", config.accessKey || "", config.secretKey || "");
      return ses;
    default:
      return new NullEmailProvider();
  }
}
