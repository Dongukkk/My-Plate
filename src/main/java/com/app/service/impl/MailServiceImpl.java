package com.app.service.impl;

import com.app.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;

@Service
public class MailServiceImpl implements MailService {

    @Autowired
    private JavaMailSender mailSender; // MailConfig의 네이버 SMTP 사용

    @Override
    public void sendPasswordResetLink(String toEmail, String link) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");

            // 보내는 주소 = MailConfig에서 설정한 계정
            String fromAddress = ((JavaMailSenderImpl) mailSender).getUsername();

            h.setTo(toEmail);
            h.setFrom(fromAddress, "My Plate");
            h.setSubject("[My Plate] 비밀번호 재설정 안내");

            String html =
            	    "<div style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6\">" +
            	    "<h2>비밀번호 재설정</h2>" +
            	    "<p>아래 버튼을 눌러 30분 이내에 비밀번호를 재설정하세요.</p>" +
            	    "<p><a href=\"" + link + "\" style=\"display:inline-block;background:#ef5350;color:#fff;" +
            	    "padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700\">" +
            	    "비밀번호 재설정</a></p>" +
            	    "<p style=\"margin-top:8px\">버튼이 동작하지 않으면 이 링크를 복사하여 브라우저에 붙여넣으세요:</p>" +
            	    "<p style=\"word-break:break-all;color:#555\">" + link + "</p>" +
            	    "</div>";

            h.setText(html, true);
            mailSender.send(msg);
        } catch (Exception e) {
            // 필요하면 로깅으로 교체
            throw new RuntimeException("메일 발송 실패: " + e.getMessage(), e);
        }
    }
}