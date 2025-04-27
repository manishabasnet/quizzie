package com.quizzie.quizzie;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DataController {

    @Autowired
    private FirebaseService firebaseService;

   @GetMapping("/data")
    public ResponseEntity<List<Map<String, Object>>> getData() {
        try {
            List<Map<String, Object>> data = firebaseService.readData();
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception e) {
            // Handle exception appropriately
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
