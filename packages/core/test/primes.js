(input) => {
  const isPrime = (num) => {
    if (num < 2) {
      return false;
    }
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        return false;
      }
    }
    return true;
  }
  
  let count = 0;
  let currNum = 2;
  
  while (count < input) {
    if (isPrime(currNum)) {
      count++;
    }
    currNum++;
  }
  
  return currNum - 1;
}