package com.quizzie.quizzie.model;

import java.util.List;

public class Quiz {
    private String title;
    private String description;
    private int timePerQuestion;
    private List<Question> questions;

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public int getTimePerQuestion() {
        return timePerQuestion;
    }
    public void setTimePerQuestion(int timePerQuestion) {
        this.timePerQuestion = timePerQuestion;
    }

    public List<Question> getQuestions() {
        return questions;
    }
    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
}

