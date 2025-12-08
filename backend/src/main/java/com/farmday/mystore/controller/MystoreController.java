package com.farmday.mystore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.mystore.service.MystoreService;

import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mystore")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MystoreController {
    
    private final MystoreService mystoreService;

    @GetMapping("/{producerId}")
    public ResponseEntity<MystoreDTO> getStore(@PathVariable long producerId){
        return ResponseEntity.ok(mystoreService.selectStore(producerId));
    }

    @GetMapping("/board/{producerId}")
    public ResponseEntity<MystoreDTO> getStoreBoard(@PathVariable long producerId){
        return ResponseEntity.ok(mystoreService.selectStoreBoard(producerId));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateStore(@RequestBody MystoreDTO dto) {
        mystoreService.updateStore(dto);
        return ResponseEntity.ok("success");
    }

    //전체 입점 상점 목록 조회
    @GetMapping("/list")
    public ResponseEntity<?> getAllStoreList(){
        return ResponseEntity.ok(mystoreService.getAllStoreList());
    }
    
}