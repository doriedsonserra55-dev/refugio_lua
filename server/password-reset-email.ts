type PasswordResetEmailInput = {
  email: string;
  token: string;
  expiresAt: Date;
  requestOrigin: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'\"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;",
    };
    return entities[character] ?? character;
  });
}

function getResetUrl(input: PasswordResetEmailInput) {
  const appUrl = (process.env.PASSWORD_RESET_APP_URL || process.env.EXPO_WEB_PREVIEW_URL || process.env.EXPO_PACKAGER_PROXY_URL || input.requestOrigin || "http://localhost:8081").replace(/\/$/, "");
  return `${appUrl}/conta?resetToken=${encodeURIComponent(input.token)}`;
}

/**
 * Envia o link por Resend quando configurado. Em desenvolvimento, a ausência
 * da chave não interrompe o fluxo da API e fica registrada para configuração.
 */
export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const resetUrl = getResetUrl(input);
  const from = process.env.PASSWORD_RESET_FROM || "Refúgio da Lua <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[PasswordReset] RESEND_API_KEY não configurada; link não enviado.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Redefina sua senha no Refúgio da Lua",
      text: `Recebemos um pedido para redefinir sua senha. Acesse ${resetUrl} em até 30 minutos. Se não foi você, ignore este e-mail.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #163041; line-height: 1.6; max-width: 560px; margin: 0 auto;">
          <h1 style="color: #2F6F8F;">Redefina sua senha</h1>
          <p>Recebemos um pedido para criar uma nova senha para sua conta no Refúgio da Lua.</p>
          <p><a href="${escapeHtml(resetUrl)}" style="display: inline-block; background: #2F6F8F; color: #FBF7EF; padding: 12px 18px; border-radius: 8px; text-decoration: none;">Criar nova senha</a></p>
          <p>Este link expira em 30 minutos e pode ser usado apenas uma vez. Se não foi você quem solicitou, ignore este e-mail.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha ao enviar e-mail de recuperação (${response.status}): ${detail.slice(0, 240)}`);
  }
}
