package com.quizzie.quizzie;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    private static final String QUIZ_COLLECTION = "quizzes";
    private static final String PARTICIPANT_COLLECTION = "quizParticipants";

    @PostMapping("/create")
    public String createQuiz(@RequestBody Map<String, Object> quizData) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        
        // Generate random quiz code
        String quizCode = generateRandomCode();

        quizData.put("started", false); // important: started = false initially

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
    
        DocumentReference docRef = db.collection("quizParticipants").document(quizCode);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot snapshot = future.get();
    
        if (snapshot.exists()) {
            Map<String, Object> data = snapshot.getData();
            Map<String, Object> participants = (Map<String, Object>) data.get("participants");
            participants.put(participantName, 0); // Add participant with score 0
    
            ApiFuture<WriteResult> writeFuture = docRef.update("participants", participants);
            writeFuture.get();
    
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
    public String startQuiz(@PathVariable String quizCode) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        DocumentReference docRef = db.collection("quiz").document(quizCode);
        DocumentReference participantsDoc = db.collection("quizParticipants").document(quizCode);

        ApiFuture<WriteResult> future1 = docRef.update("started", true);
        ApiFuture<WriteResult> future2 = participantsDoc.update("started", true);

        future1.get();
        future2.get();

        return "Quiz started successfully!";
    }

    @GetMapping("/participants/{quizCode}")
    public Map<String, Object> getParticipants(@PathVariable String quizCode) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        DocumentSnapshot snapshot = db.collection(PARTICIPANT_COLLECTION).document(quizCode).get().get();

        if (snapshot.exists()) {
            Map<String, Object> data = snapshot.getData();
            return data;
        } else {
            return Map.of();
        }
    }

    private String generateRandomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(characters.charAt((int) (Math.random() * characters.length())));
        }
        return code.toString();
    }
}
