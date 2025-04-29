package com.quizzie.quizzie;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;

import com.quizzie.quizzie.AnswerRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    private static final String QUIZ_COLLECTION = "quizzes";
    private static final String PARTICIPANT_COLLECTION = "create-participants";

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create")
    public String createQuiz(@RequestBody Map<String, Object> quizData) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        String quizCode = generateRandomCode();

        quizData.put("started", false);

        ApiFuture<WriteResult> future = db.collection(QUIZ_COLLECTION).document(quizCode).set(quizData);
        future.get();

        return quizCode;
    }

    @PostMapping("/create-participants")
    public String createParticipantDb(@RequestBody Map<String, Object> data) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<WriteResult> future = db.collection(PARTICIPANT_COLLECTION).document((String) data.get("quizCode")).set(data);
        future.get();
        return "Participant DB created";
    }

    @PostMapping("/join-host")
    public String joinHost(@RequestBody Map<String, String> request) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        String quizCode = request.get("quizCode");
        String hostName = request.get("hostName");

        Map<String, Object> updates = new HashMap<>();
        updates.put("host", hostName);

        ApiFuture<WriteResult> future = db.collection(PARTICIPANT_COLLECTION).document(quizCode).update(updates);
        future.get();
        return "Host updated successfully";
    }

    @PostMapping("/join-participant")
    public String joinParticipant(@RequestBody Map<String, String> request) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        String quizCode = request.get("quizCode");
        String participantName = request.get("participantName");

        DocumentReference docRef = db.collection(PARTICIPANT_COLLECTION).document(quizCode);
        DocumentSnapshot snapshot = docRef.get().get();

        if (snapshot.exists()) {
            Map<String, Object> participants = (Map<String, Object>) snapshot.get("participants");
            if (participants == null) {
                participants = new HashMap<>();
            }
            participants.put(participantName, 0);

            docRef.update("participants", participants);
            return "Participant joined successfully";
        } else {
            return "Quiz not found";
        }
    }

    @GetMapping("/status/{quizCode}")
    public Map<String, Boolean> getQuizStatus(@PathVariable String quizCode) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot snapshot = db.collection(QUIZ_COLLECTION).document(quizCode).get().get();

        if (snapshot.exists()) {
            Boolean started = snapshot.getBoolean("started");
            return Map.of("started", started != null && started);
        } else {
            return Map.of("started", false);
        }
    }

    @PostMapping("/start/{quizCode}")
public ResponseEntity<String> startQuiz(@PathVariable String quizCode) {
    Firestore db = FirestoreClient.getFirestore();
    try {
        DocumentReference quizDoc = db.collection("quizzes").document(quizCode);
        DocumentSnapshot quizSnapshot = quizDoc.get().get();

        if (!quizSnapshot.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found!");
        }

        // Mark quiz as started in Firestore
        quizDoc.update("started", true);

        // Send the first question
        List<Map<String, Object>> questions = (List<Map<String, Object>>) quizSnapshot.get("questions");
        if (questions != null && !questions.isEmpty()) {
            Map<String, Object> firstQuestion = questions.get(0);
            messagingTemplate.convertAndSend("/topic/question/" + quizCode, firstQuestion);
        }

        return ResponseEntity.ok("Quiz started successfully!");
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error starting quiz");
    }
}

    @GetMapping("/participants/{quizCode}")
    public Map<String, Object> getParticipants(@PathVariable String quizCode) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot snapshot = db.collection(PARTICIPANT_COLLECTION).document(quizCode).get().get();

        if (snapshot.exists()) {
            return snapshot.getData();
        } else {
            return Map.of();
        }
    }

    @PostMapping("/submit-answer")
    public ResponseEntity<String> submitAnswer(@RequestBody AnswerRequest answerRequest) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        String quizCode = answerRequest.getQuizCode();
        String playerName = answerRequest.getPlayerName();
        String selectedOption = answerRequest.getSelectedOption();
        Long timeTaken = answerRequest.getTimeTaken();

        // Fetch quiz info
        DocumentSnapshot quizSnapshot = db.collection(QUIZ_COLLECTION).document(quizCode).get().get();
        String correctAnswer = quizSnapshot.getString("currentCorrectAnswer");
        Long timePerQuestion = quizSnapshot.getLong("timePerQuestion");

        int pointsEarned = 0;
        if (selectedOption != null && selectedOption.equals(correctAnswer)) {
            if (timeTaken != null && timeTaken <= timePerQuestion / 2) {
                pointsEarned = 10;
            } else {
                pointsEarned = 5;
            }
        } else {
            pointsEarned = 0;
        }

        DocumentReference participantDoc = db.collection(PARTICIPANT_COLLECTION).document(quizCode);
        DocumentSnapshot participantSnapshot = participantDoc.get().get();
        Map<String, Object> participantData = participantSnapshot.getData();
        Map<String, Long> participants = (Map<String, Long>) participantData.get("participants");

        Long currentScore = participants.getOrDefault(playerName, 0L);
        participants.put(playerName, currentScore + pointsEarned);

        participantDoc.update("participants", participants);

        return ResponseEntity.ok("Answer submitted and score updated");
    }

    @GetMapping("/leaderboard/{quizCode}")
    public Map<String, Object> getLeaderboard(@PathVariable String quizCode) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot snapshot = db.collection(PARTICIPANT_COLLECTION).document(quizCode).get().get();

        Map<String, Object> response = new HashMap<>();
        response.put("quizCode", quizCode);
        response.put("participants", snapshot.get("participants")); // <<<< correct field!

        return response;
    }

    private String generateRandomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(characters.charAt((int) (Math.random() * characters.length())));
        }
        return code.toString();
    }
    @PostMapping("/next-question/{quizCode}")
    public ResponseEntity<String> sendNextQuestion(@PathVariable String quizCode) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
    
        DocumentReference participantDoc = db.collection("create-participants").document(quizCode);
        DocumentReference quizDoc = db.collection("quizzes").document(quizCode);
    
        // Fetch current index
        DocumentSnapshot participantSnapshot = participantDoc.get().get();
        DocumentSnapshot quizSnapshot = quizDoc.get().get();
    
        if (!participantSnapshot.exists() || !quizSnapshot.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found!");
        }
    
        Long currentIndex = participantSnapshot.getLong("currentQuestionIndex");
        if (currentIndex == null) currentIndex = 0L;
    
        List<Map<String, Object>> questions = (List<Map<String, Object>>) quizSnapshot.get("questions"); // ✅
    
        if (currentIndex >= questions.size()) {
            // No more questions left -> Send leaderboard signal
            messagingTemplate.convertAndSend("/topic/quiz-end", "Quiz Ended");
            return ResponseEntity.ok("Quiz ended");
        }
    
        // Send the question
        Map<String, Object> question = questions.get(currentIndex.intValue());
        messagingTemplate.convertAndSend("/topic/question/" + quizCode, question);
    
        // Increment index
        participantDoc.update("currentQuestionIndex", currentIndex + 1);
    
        return ResponseEntity.ok("Question sent successfully!");
    } 
    
    @GetMapping("/current-question/{quizCode}")
public ResponseEntity<?> getCurrentQuestion(@PathVariable String quizCode) throws Exception {
    Firestore db = FirestoreClient.getFirestore();
    DocumentReference quizDoc = db.collection("quizzes").document(quizCode);
    DocumentReference participantDoc = db.collection("create-participants").document(quizCode);

    DocumentSnapshot quizSnapshot = quizDoc.get().get();
    DocumentSnapshot participantSnapshot = participantDoc.get().get();

    if (!quizSnapshot.exists() || !participantSnapshot.exists()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found");
    }

    List<Map<String, Object>> questions = (List<Map<String, Object>>) quizSnapshot.get("questions");
    Long currentIndex = participantSnapshot.getLong("currentQuestionIndex");
    if (currentIndex == null) currentIndex = 0L;

    if (currentIndex >= questions.size()) {
        return ResponseEntity.ok(Map.of("finished", true)); // No more questions
    }

    Map<String, Object> question = questions.get(currentIndex.intValue());
    return ResponseEntity.ok(question);
}

}
