package com.quizzie.quizzie.controller;

import com.quizzie.quizzie.model.Quiz;
import com.quizzie.quizzie.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000") // Allowing React to connect
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/create")
    public String createQuiz(@RequestBody Quiz quiz) {
        try {
            String quizCode = quizService.saveQuiz(quiz);
            return quizCode;
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }
}
