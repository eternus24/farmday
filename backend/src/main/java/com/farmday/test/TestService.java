// backend/src/main/java/com/farmday/test/TestTableService.java
package com.farmday.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.farmday.test.TestMapper;

@Service
public class TestService {

    @Autowired
    TestMapper testMapper;

    public List<TestDTO> getAll() throws Exception {
        return testMapper.getAll();
    }

}
