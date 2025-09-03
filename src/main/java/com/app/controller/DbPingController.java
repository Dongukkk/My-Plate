package com.app.controller;

import com.app.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DbPingController {
	
  @Autowired private UserMapper userMapper;

  @GetMapping("/dbping")
  public Map<String,Object> dbping(){
    Integer v = userMapper.ping();
    Map<String,Object> res = new HashMap<>();
    res.put("db", (v!=null && v==1) ? "ok" : "fail");
    return res;
  }
}