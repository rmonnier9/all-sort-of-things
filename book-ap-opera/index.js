fetch("https://www.operadeparis.fr/saison-22-23/ballet/signes/performances")
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
    return res;
  })
  .then((res) => {
    const url = res.items[0].content.block.buttons[0].url;
    const perfId = res.items[0].perfId;
    console.log(url);
    console.log(peridId);
    if (url) {
      window.open(url);
      window.open(
        `https://billetterie.operadeparis.fr/secured/selection/event/seat?perfId=${perfId}&lang=fr#`
      );
    } else {
      console.log("Bientôt");
    }
  });
