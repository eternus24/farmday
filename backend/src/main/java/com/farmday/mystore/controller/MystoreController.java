package com.farmday.mystore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.mystore.service.MystoreService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mystore")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MystoreController {
    
    private final MystoreService mystoreService;

    @GetMapping("/{productId}")
    public ResponseEntity<MystoreDTO> getStore(@PathVariable long producerId){
        return ResponseEntity.ok(mystoreService.selectStore(producerId));
    }

    @GetMapping("/board/{producerId}")
    public ResponseEntity<MystoreDTO> getStoreBoard(@PathVariable long producerId){
        return ResponseEntity.ok(mystoreService.selectStoreBoard(producerId));
    }
    
    
}