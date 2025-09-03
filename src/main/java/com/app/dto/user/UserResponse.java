package com.app.dto.user;

public class UserResponse {
	
	private Long id;
	private String email;
	private String name;
	private String role;
	private String provider;
	private String providerId;
	
	public UserResponse() { }
	
	public UserResponse(Long id, String email, String name, String role, String provider) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.provider = provider;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }

	public String getProvider() { return provider; }
	public void setProvider(String provider) { this.provider = provider; }

	public String getProviderId() { return providerId; }
	public void setProviderId(String providerId) { this.providerId = providerId;}    
    
}
