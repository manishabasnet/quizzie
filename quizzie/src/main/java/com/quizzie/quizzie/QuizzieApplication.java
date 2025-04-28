package com.quizzie.quizzie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class QuizzieApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuizzieApplication.class, args);
	}
}
