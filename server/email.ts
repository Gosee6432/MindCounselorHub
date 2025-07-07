import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>비밀번호 재설정</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">좋은 수련, 좋은 상담자</div>
            </div>
            
            <div class="content">
                <h2>비밀번호 재설정 요청</h2>
                <p>안녕하세요,</p>
                <p>회원님의 계정에 대한 비밀번호 재설정 요청을 받았습니다.</p>
                <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">비밀번호 재설정</a>
                </div>
                
                <p><strong>주의사항:</strong></p>
                <ul>
                    <li>이 링크는 1시간 후 만료됩니다</li>
                    <li>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요</li>
                    <li>보안을 위해 링크는 한 번만 사용 가능합니다</li>
                </ul>
                
                <p>링크가 작동하지 않는 경우 아래 주소를 복사하여 브라우저에 직접 입력하세요:</p>
                <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
            </div>
            
            <div class="footer">
                <p>이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.</p>
                <p>© 2025 좋은 수련, 좋은 상담자. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
비밀번호 재설정 요청

안녕하세요,

회원님의 계정에 대한 비밀번호 재설정 요청을 받았습니다.
아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요:

${resetUrl}

주의사항:
- 이 링크는 1시간 후 만료됩니다
- 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요
- 보안을 위해 링크는 한 번만 사용 가능합니다

© 2025 좋은 수련, 좋은 상담자
  `;

  return await sendEmail({
    to: email,
    from: 'noreply@goodtraining.com', // SendGrid에서 인증된 발신자 이메일로 변경 필요
    subject: '[좋은 수련, 좋은 상담자] 비밀번호 재설정',
    text: textContent,
    html: htmlContent,
  });
}