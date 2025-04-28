package com.quizzie.quizzie;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class QuizSocketController {

    @MessageMapping("/startQuiz") // Frontend sends to /app/startQuiz
    @SendTo("/topic/quizStarted") // Backend sends to /topic/quizStarted
    public String startQuiz() {
        return "Quiz started!";
    }
}
