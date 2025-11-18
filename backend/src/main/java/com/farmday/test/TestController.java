// backend/src/main/java/com/farmday/testtable/TestTableController.java
package com.farmday.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class TestController {

    private final TestService testService;
    public TestController(TestService testService) { this.testService = testService; }

    @ResponseBody
    @GetMapping("/api/test")
    public List<TestDTO> findAll() throws Exception {
        return testService.getAll();
    }
}
