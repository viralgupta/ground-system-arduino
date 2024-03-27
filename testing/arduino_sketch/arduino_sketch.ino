void setup() {
  // Initialize serial communication with a baud rate of 9600 bps
  Serial.begin(9600);
}

void loop() {
  // Generate random values within specified ranges
  float lat = random(-90.0, 90.0);
  float lon = random(-180.0, 180.0);
  float alt = random(-100.0, 10000.0);
  float temp1 = random(-50.0, 50.0);
  float press = random(800.0, 1200.0);
  float angx = random(-180.0, 180.0);
  float angy = random(-180.0, 180.0);
  float angz = random(-180.0, 180.0);
  float accelx = random(-10.0, 10.0);
  float accely = random(-10.0, 10.0);
  float accelz = random(-10.0, 10.0);
  float temp2 = random(-50.0, 50.0);

  // Print the mock data in the format expected by your regular expression
  Serial.print(lat);
  Serial.print(" ,");
  Serial.print(lon);
  Serial.print(" ,");
  Serial.print(alt);
  Serial.print(" ,");
  Serial.print(temp1);
  Serial.print(" ,");
  Serial.print(press);
  Serial.print(" ,");
  Serial.print(angx);
  Serial.print(" ,");
  Serial.print(angy);
  Serial.print(" ,");
  Serial.print(angz);
  Serial.print(" ,");
  Serial.print(accelx);
  Serial.print(" ,");
  Serial.print(accely);
  Serial.print(" ,");
  Serial.print(accelz);
  Serial.print(" ,");
  Serial.println(temp2);

  delay(1000); // Delay for 1 second before generating next set of mock data
}