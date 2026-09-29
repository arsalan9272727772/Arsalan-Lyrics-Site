fetch("lyrics.txt")
  .then(response => response.text())
  .then(text => {
    const lyrics = text.split(/\r?\n/).filter(line => line.trim());
    const colors = ["#ff0000","#ff7a00","#00ff44","#00aaff","#b000ff"];
    const lyricBox = document.getElementById("lyrics");
    let index = 0;

    function showNextLyric() {
      lyricBox.style.animation = "none";
      void lyricBox.offsetWidth;
      lyricBox.textContent = lyrics[index];
      lyricBox.style.color = colors[index % colors.length];
      lyricBox.style.animation = "lyricShow 0.8s ease";
      index = (index + 1) % lyrics.length;
    }

    showNextLyric();
    setInterval(showNextLyric, 3000);
  });
