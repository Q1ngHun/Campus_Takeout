package com.suda.campus.controller;

import com.suda.campus.service.CampusDataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CampusApiController {

    private final CampusDataStore dataStore;

    public CampusApiController(CampusDataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "campus-suda",
                "time", LocalDateTime.now().toString()
        );
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        return dataStore.home();
    }

    @GetMapping("/merchants")
    public Map<String, Object> merchants() {
        return Map.of("list", dataStore.merchants(), "total", dataStore.merchants().size());
    }

    @GetMapping("/merchants/{id}")
    public ResponseEntity<Map<String, Object>> merchant(@PathVariable String id) {
        return dataStore.merchant(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam(defaultValue = "") String q) {
        return dataStore.search(q);
    }

    @GetMapping("/orders")
    public Map<String, Object> orders() {
        return Map.of("list", dataStore.orders(), "total", dataStore.orders().size());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> order(@PathVariable String id) {
        return dataStore.order(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/orders")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> payload) {
        Map<String, Object> order = dataStore.createOrder(payload);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "下单成功，商家正在准备");
        response.put("order", order);
        return response;
    }

    @GetMapping("/coupons")
    public Map<String, Object> coupons() {
        return Map.of("list", dataStore.coupons());
    }

    @GetMapping("/addresses")
    public Map<String, Object> addresses() {
        return Map.of("list", dataStore.addresses());
    }

    @PostMapping("/addresses")
    public Map<String, Object> addAddress(@RequestBody Map<String, Object> payload) {
        return Map.of("success", true, "address", dataStore.addAddress(payload));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<Map<String, Object>> setDefaultAddress(@PathVariable String id) {
        return dataStore.setDefaultAddress(id)
                .map(address -> ResponseEntity.ok(Map.of("success", true, "address", address)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user")
    public Object user() {
        return dataStore.user();
    }

    @GetMapping("/notifications")
    public Object notifications() {
        return dataStore.notifications();
    }

    @GetMapping("/hot-searches")
    public Object hotSearches() {
        return dataStore.hotSearches();
    }
}
