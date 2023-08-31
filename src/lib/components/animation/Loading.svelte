<div class="dot-flashing"></div>

<style>
  .dot-flashing {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #ffffff;
  color: #ffffff;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
  margin-left: .75rem;
}
.dot-flashing::before, .dot-flashing::after {
  content: "";
  display: inline-block;
  position: absolute;
  top: 0;
}
.dot-flashing::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #ffffff;
  color: #ffffff;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}
.dot-flashing::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #ffffff;
  color: #ffffff;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: #ffffff;
  }
  50%, 100% {
    background-color: rgba(72, 82, 117, 0.2);
  }
}
</style>