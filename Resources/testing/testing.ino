void setup() {
  // Initialize serial communication with a baud rate of 9600 bps
  Serial.begin(9600);
}

void loop() {
  // Generate random values within specified ranges
  // float lat = random(-90.0, 90.0);
  // float lon = random(-180.0, 180.0);
  // float alt = random(-100.0, 10000.0);
  // float temp1 = random(-50.0, 50.0);
  // float press = random(800.0, 1200.0);
  // float angx = random(-180.0, 180.0);
  // float angy = random(-180.0, 180.0);
  // float angz = random(-180.0, 180.0);
  // float accelx = random(-10.0, 10.0);
  // float accely = random(-10.0, 10.0);
  // float accelz = random(-10.0, 10.0);
  // float temp2 = random(-50.0, 50.0);

  // Print the mock data in the format expected by your regular expression
  Serial.println("<2022ASI-003><3:27:34><67.00><224.19><98661.09><34.79><33.64><4.20><21:57:32><28.7646><72.5656><250.00><4.00><0.02><0.10><1.00><-0.15><-0.02><-0.09><0.06><-0.07><-0.38><291.00><1.00><4.00><79998.00>");

  delay(1000); // Delay for 1 second before generating next set of mock data
}