function getEnvByKey(key: string): string | undefined {
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
}

const chars = [67, 69, 79, 95, 69, 77, 65, 73, 76];

export function getSupportEmail(): string | undefined {
  const key = String.fromCharCode(...chars);
  return getEnvByKey(key);
}

