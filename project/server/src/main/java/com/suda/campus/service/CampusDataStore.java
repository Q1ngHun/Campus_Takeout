package com.suda.campus.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class CampusDataStore {

    private final ObjectMapper objectMapper;
    private Map<String, Object> data = new LinkedHashMap<>();
    private final List<Map<String, Object>> orders = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> addresses = Collections.synchronizedList(new ArrayList<>());

    public CampusDataStore(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    @SuppressWarnings("unchecked")
    public void load() throws IOException {
        try (InputStream input = new ClassPathResource("mock-data.json").getInputStream()) {
            data = objectMapper.readValue(input, new TypeReference<>() {});
        }
        orders.clear();
        orders.addAll((List<Map<String, Object>>) data.getOrDefault("orders", List.of()));
        addresses.clear();
        addresses.addAll((List<Map<String, Object>>) data.getOrDefault("addresses", List.of()));
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> categories() {
        return (List<Map<String, Object>>) data.getOrDefault("categories", List.of());
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> merchants() {
        return (List<Map<String, Object>>) data.getOrDefault("merchants", List.of());
    }

    public Optional<Map<String, Object>> merchant(String id) {
        return merchants().stream()
                .filter(item -> id.equals(item.get("id")))
                .findFirst();
    }

    public List<Map<String, Object>> orders() {
        synchronized (orders) {
            return orders.stream()
                    .map(item -> (Map<String, Object>) item)
                    .collect(Collectors.toList());
        }
    }

    public Optional<Map<String, Object>> order(String id) {
        synchronized (orders) {
            return orders.stream()
                    .filter(item -> id.equals(item.get("id")))
                    .map(item -> (Map<String, Object>) item)
                    .findFirst();
        }
    }

    public Map<String, Object> createOrder(Map<String, Object> payload) {
        Map<String, Object> order = new LinkedHashMap<>(payload);
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        order.putIfAbsent("id", "SD" + stamp + ThreadLocalRandom.current().nextInt(10, 99));
        order.putIfAbsent("status", "preparing");
        order.putIfAbsent("statusText", "商家制作中");
        order.putIfAbsent("createdAt", "刚刚");
        order.putIfAbsent("rider", Map.of(
                "name", "周师傅",
                "phone", "138****6621",
                "avatar", "周"
        ));
        synchronized (orders) {
            orders.add(0, order);
        }
        return order;
    }

    public List<Map<String, Object>> coupons() {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> coupons = (List<Map<String, Object>>) data.getOrDefault("coupons", List.of());
        return coupons;
    }

    public List<Map<String, Object>> addresses() {
        synchronized (addresses) {
            return addresses.stream()
                    .map(item -> (Map<String, Object>) item)
                    .collect(Collectors.toList());
        }
    }

    public Map<String, Object> addAddress(Map<String, Object> payload) {
        Map<String, Object> address = new LinkedHashMap<>(payload);
        address.putIfAbsent("id", "a" + System.currentTimeMillis());
        address.putIfAbsent("default", addresses.isEmpty());
        synchronized (addresses) {
            if (Boolean.TRUE.equals(address.get("default"))) {
                addresses.forEach(item -> item.put("default", false));
            }
            addresses.add(0, address);
        }
        return address;
    }

    public Optional<Map<String, Object>> setDefaultAddress(String id) {
        synchronized (addresses) {
            for (Map<String, Object> address : addresses) {
                boolean selected = id.equals(address.get("id"));
                address.put("default", selected);
            }
            return addresses.stream()
                    .filter(item -> id.equals(item.get("id")))
                    .findFirst();
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> search(String keyword) {
        String query = keyword == null ? "" : keyword.trim().toLowerCase();
        List<Map<String, Object>> matchedMerchants = new ArrayList<>();
        List<Map<String, Object>> matchedDishes = new ArrayList<>();

        for (Map<String, Object> shop : merchants()) {
            String text = String.join(" ",
                    String.valueOf(shop.get("name")),
                    String.valueOf(shop.get("en")),
                    String.valueOf(shop.get("tags")),
                    String.valueOf(shop.get("hot"))).toLowerCase();
            if (text.contains(query)) {
                matchedMerchants.add(shop);
            }
            Object dishes = shop.get("dishes");
            if (dishes instanceof List<?> list) {
                for (Object dish : list) {
                    if (dish instanceof Map<?, ?> dishMap) {
                        String dishText = (String.valueOf(dishMap.get("name")) + " " + dishMap.get("desc")).toLowerCase();
                        if (dishText.contains(query)) {
                            Map<String, Object> result = new LinkedHashMap<>((Map<String, Object>) dishMap);
                            result.put("shopId", shop.get("id"));
                            result.put("shopName", shop.get("name"));
                            matchedDishes.add(result);
                        }
                    }
                }
            }
        }

        return Map.of(
                "merchants", matchedMerchants,
                "dishes", matchedDishes,
                "count", matchedMerchants.size() + matchedDishes.size()
        );
    }

    public Map<String, Object> home() {
        Map<String, Object> home = new LinkedHashMap<>();
        home.put("categories", categories());
        home.put("merchants", merchants());
        home.put("user", data.get("user"));
        home.put("coupons", coupons().stream()
                .filter(item -> "available".equals(item.get("status")))
                .collect(Collectors.toList()));
        home.put("activeOrders", orders().stream()
                .filter(item -> "delivering".equals(item.get("status")) || "preparing".equals(item.get("status")))
                .collect(Collectors.toList()));
        return home;
    }

    public Object user() {
        return data.get("user");
    }

    public Object notifications() {
        return data.getOrDefault("notifications", List.of());
    }

    public Object hotSearches() {
        return data.getOrDefault("hotSearches", List.of());
    }
}
