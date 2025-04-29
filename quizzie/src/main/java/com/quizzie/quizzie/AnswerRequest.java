package com.quizzie.quizzie;

public class AnswerRequest {
    private String quizCode;
    private String playerName;
    private String selectedOption;
    private Long timeTaken; 

    // Getters and Setters

    public String getQuizCode() { return quizCode; }
    public void setQuizCode(String quizCode) { this.quizCode = quizCode; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getSelectedOption() { return selectedOption; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }

    public Long getTimeTaken() { return timeTaken; }
    public void setTimeTaken(Long timeTaken) { this.timeTaken = timeTaken; }
}
