package com.app.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.app.dto.UserDTO;
import com.app.dto.account.PasswordChangeRequest;
import com.app.mapper.UserMapper;
import com.app.security.PasswordUtil;
import com.app.service.AccountService;

@Service
public class AccountServiceImpl implements AccountService {
	
	@Autowired 
	private UserMapper userMapper;
	
	 private void validateNewPassword(String pwd) {
		 
	       if (pwd == null || pwd.length() < 8 || pwd.length() > 64)
	            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호는 8~64자여야 합니다.");
	       
	       // 영문+숫자 1개 이상(특수문자 허용)
	       if (!pwd.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d\\p{Punct}]{8,64}$"))
	            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "영문과 숫자를 포함해야 합니다.");
	    }
	 
	 @Override
	 @Transactional
	 public void changePassword(String email, PasswordChangeRequest req) {
	     if (email == null || email.isBlank())
	         throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보가 없습니다.");
	     if (req == null)
	         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "요청이 비었습니다.");

	     String current = req.getCurrentPassword();
	     String next = req.getNewPassword();
	     validateNewPassword(next);

	     // ① email로 찾고, 없으면 username으로도 한 번 더
	     UserDTO user = userMapper.findByEmail(email);
	     if (user == null && email != null) {
	         user = userMapper.findByUsername(email);
	     }
	     if (user == null)
	         throw new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자를 찾을 수 없습니다.");

	     String provider = user.getProvider();     // "MYPLATE" | "GOOGLE" | ...
	     String hashed   = user.getPassword();     // 현재 해시 (null 가능)

	     boolean isLocal = "MYPLATE".equalsIgnoreCase(provider) || provider == null;
	     boolean hasPassword = hashed != null && !hashed.isBlank();

	     if (!(isLocal || hasPassword))
	         throw new ResponseStatusException(HttpStatus.FORBIDDEN, "소셜 전용 계정은 비밀번호 변경이 불가합니다.");

	     if (!hasPassword)
	         throw new ResponseStatusException(HttpStatus.FORBIDDEN, "현재 비밀번호가 설정되어 있지 않습니다.");

	     if (current == null || current.isBlank())
	         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호를 입력하세요.");

	     if (!PasswordUtil.matches(current, hashed))
	         throw new ResponseStatusException(HttpStatus.FORBIDDEN, "현재 비밀번호가 일치하지 않습니다.");

	     if (PasswordUtil.matches(next, hashed))
	         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기존 비밀번호와 동일합니다.");

	     String newHash = PasswordUtil.hash(next);

	     // ② 업데이트는 user의 실제 이메일 기준으로
	     int updated = userMapper.updatePasswordByEmail(user.getEmail(), newHash);
	     if (updated == 0)
	         throw new ResponseStatusException(HttpStatus.NOT_FOUND, "비밀번호 변경에 실패했습니다.");

	     // (디버그) 실제로 어떤 값이었는지 확인하고 싶다면:
	     System.out.println("[pw-change] principalName=" + email + ", realEmail=" + user.getEmail());
	 }
}
