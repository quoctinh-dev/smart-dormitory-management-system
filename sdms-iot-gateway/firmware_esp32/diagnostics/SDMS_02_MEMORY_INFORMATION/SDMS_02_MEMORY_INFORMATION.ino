/*
 * ============================================================
 * SDMS ESP32 Diagnostic Toolkit
 * Step 02 - Memory Information
 * ============================================================
 */

#include <Arduino.h>
#include "esp_heap_caps.h"

void printSeparator() {
    Serial.println("============================================================");
}

void printSection(const char* title) {
    Serial.println();
    Serial.print("[ ");
    Serial.print(title);
    Serial.println(" ]");
    Serial.println("------------------------------------------------------------");
}

void printResult(const char* item, const String& value) {
    Serial.printf("%-28s : %s\n", item, value.c_str());
}

void printHeader() {

    printSeparator();
    Serial.println("      SDMS ESP32 DIAGNOSTIC TOOLKIT");
    Serial.println("      STEP 02 - MEMORY INFORMATION");
    printSeparator();
}

//////////////////////////////////////////////////////////
// Internal Heap
//////////////////////////////////////////////////////////

void printInternalHeap() {

    printSection("INTERNAL HEAP");

    printResult("Total Heap",
        String(ESP.getHeapSize()) + " Bytes");

    printResult("Free Heap",
        String(ESP.getFreeHeap()) + " Bytes");

    printResult("Minimum Free Heap",
        String(ESP.getMinFreeHeap()) + " Bytes");

    printResult("Largest Free Block",
        String(ESP.getMaxAllocHeap()) + " Bytes");
}

//////////////////////////////////////////////////////////
// PSRAM
//////////////////////////////////////////////////////////

void printPSRAM() {

    printSection("PSRAM");

    if (!psramFound()) {

        printResult("PSRAM", "NOT FOUND");
        return;
    }

    printResult("PSRAM", "FOUND");

    printResult("Total PSRAM",
        String(ESP.getPsramSize()) + " Bytes");

    printResult("Free PSRAM",
        String(ESP.getFreePsram()) + " Bytes");

    printResult("Largest PSRAM Block",
        String(ESP.getMaxAllocPsram()) + " Bytes");
}

//////////////////////////////////////////////////////////
// Memory Capability
//////////////////////////////////////////////////////////

void printCapability() {

    printSection("MEMORY CAPABILITY");

    printResult(
        "8-bit RAM",
        String(heap_caps_get_free_size(MALLOC_CAP_8BIT)) + " Bytes");

    printResult(
        "32-bit RAM",
        String(heap_caps_get_free_size(MALLOC_CAP_32BIT)) + " Bytes");

    printResult(
        "DMA RAM",
        String(heap_caps_get_free_size(MALLOC_CAP_DMA)) + " Bytes");

    printResult(
        "Internal RAM",
        String(heap_caps_get_free_size(MALLOC_CAP_INTERNAL)) + " Bytes");

    printResult(
        "Executable RAM",
        String(heap_caps_get_free_size(MALLOC_CAP_EXEC)) + " Bytes");

#ifdef MALLOC_CAP_SPIRAM
    printResult(
        "External PSRAM",
        String(heap_caps_get_free_size(MALLOC_CAP_SPIRAM)) + " Bytes");
#endif
}

//////////////////////////////////////////////////////////
// Allocation Test
//////////////////////////////////////////////////////////

bool allocationTest(size_t size, uint32_t cap) {

    void* ptr = heap_caps_malloc(size, cap);

    if (ptr == nullptr)
        return false;

    heap_caps_free(ptr);

    return true;
}

void printAllocationTest() {

    printSection("ALLOCATION TEST");

    printResult(
        "1 KB",
        allocationTest(1024, MALLOC_CAP_8BIT) ? "PASS" : "FAIL");

    printResult(
        "10 KB",
        allocationTest(10 * 1024, MALLOC_CAP_8BIT) ? "PASS" : "FAIL");

    printResult(
        "100 KB",
        allocationTest(100 * 1024, MALLOC_CAP_8BIT) ? "PASS" : "FAIL");

    printResult(
        "500 KB",
        allocationTest(500 * 1024, MALLOC_CAP_SPIRAM) ? "PASS" : "FAIL");

    if (psramFound()) {

        printResult(
            "1 MB PSRAM",
            allocationTest(1024 * 1024,
            MALLOC_CAP_SPIRAM) ? "PASS" : "FAIL");
    }
}

//////////////////////////////////////////////////////////
// Memory Health
//////////////////////////////////////////////////////////

void printHealth() {

    printSection("MEMORY HEALTH");

    uint32_t freeHeap = ESP.getFreeHeap();
    uint32_t largest  = ESP.getMaxAllocHeap();

    float ratio = (float)largest / freeHeap;

    if (ratio > 0.90f)
        printResult("Fragmentation", "Excellent");

    else if (ratio > 0.70f)
        printResult("Fragmentation", "Good");

    else if (ratio > 0.50f)
        printResult("Fragmentation", "Normal");

    else
        printResult("Fragmentation", "Poor");

    printResult("Memory Status", "HEALTHY");
}

//////////////////////////////////////////////////////////

void printFooter() {

    printSeparator();
    Serial.println("Memory Diagnostic Completed.");
    printSeparator();
}

//////////////////////////////////////////////////////////

void setup() {

    Serial.begin(115200);

    delay(3000);

    printHeader();

    printInternalHeap();

    printPSRAM();

    printCapability();

    printAllocationTest();

    printHealth();

    printFooter();
}

void loop() {

}