package com.app.dto;
import java.time.LocalDateTime;

public class UserDTO {
  private Long id;
  private String email;
  private String password;     
  private String username;
  private String address;
  private String phoneNumber;
  private String role;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime leaveDate;
  private String provider;
  private String providerId;

  public Long getId() { return id; }
  
  public void setId(Long id) { this.id = id; }
  
  public String getEmail() { return email; }
  
  public void setEmail(String email) { this.email = email; }
  
  public String getPassword() { return password; }
  
  public void setPassword(String password) { this.password = password; }
  
  public String getUsername() { return username; }
  
  public void setUsername(String username) { this.username = username; }
  
  public String getAddress() { return address; }
  
  public void setAddress(String address) { this.address = address; }
  
  public String getPhoneNumber() { return phoneNumber; }
  
  public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
  
  public String getRole() { return role; }
  
  public void setRole(String role) { this.role = role; }
  
  public String getStatus() { return status; }
  
  public void setStatus(String status) { this.status = status; }
  
  public LocalDateTime getCreatedAt() { return createdAt; }
  
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
  
  public LocalDateTime getUpdatedAt() { return updatedAt; }
  
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
  
  public LocalDateTime getLeaveDate() { return leaveDate; }
  
  public void setLeaveDate(LocalDateTime leaveDate) { this.leaveDate = leaveDate; }

  public String getProvider() { return provider; }
	
  public void setProvider(String provider) { this.provider = provider; }
	
  public String getProviderId() { return providerId; }
	
 public void setProviderId(String providerId) { this.providerId = providerId; }
  
  
  
}