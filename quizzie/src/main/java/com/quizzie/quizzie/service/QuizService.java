package com.quizzie.quizzie.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.quizzie.quizzie.model.Quiz;
import org.springframework.stereotype.Service;
import com.google.firebase.cloud.FirestoreClient;

import java.util.UUID;

@Service
public class QuizService {

    public String saveQuiz(Quiz quiz) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        // Generate random quiz code
        String quizCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Save under 'quizzes' collection
        DocumentReference docRef = db.collection("quizzes").document(quizCode);

        ApiFuture<com.google.cloud.firestore.WriteResult> result = docRef.set(quiz);

        result.get();

        return quizCode;
    }
}
