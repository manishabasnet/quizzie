package com.quizzie.quizzie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//These imports are for demo 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class QuizzieApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuizzieApplication.class, args);
	}

	@RequestMapping("/")
	public String home() {
		return "hello world, Java spring boot is active.";
	}

}
