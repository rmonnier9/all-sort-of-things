const getQuantityInfoForCategoryId = (categoryId, stadium) => {
  let totalQuantity = 0;
  let maxQuantityPerZone = 0;

  for (let i = 0; i < stadium.zoneCoordinates.length; i++) {
    let zone = stadium.zoneCoordinates[i];

    for (let j = 0; j < zone.categoryZoneStocks.length; j++) {
      let category = zone.categoryZoneStocks[j];

      if (category.categoryId === categoryId) {
        totalQuantity += category.quantity;

        if (category.quantity > maxQuantityPerZone) {
          maxQuantityPerZone = category.quantity;
        }
      }
    }
  }

  return { totalQuantity, maxQuantityPerZone };
};

const functionBookSeat = (offerId, date, sessionId) =>
  fetch(
    `https://tickets.rolandgarros.com/api/v2/fr/ticket/category/page/offer/${offerId}/date/${date}/sessions/${sessionId}`,
    {}
  )
    .then((res) => res.json())
    .then((body) => {
      const categoryAvailable = body.categories.find(
        (category) => category.hasStock === true
      );
      if (!categoryAvailable) {
        console.log(sessionId, "Nothing available");
      } else {
        const { totalQuantity, maxQuantityPerZone } =
          getQuantityInfoForCategoryId(categoryAvailable.id, body.stadium);

        console.log(
          sessionId,
          categoryAvailable.price,
          "is available, with quantity :",
          totalQuantity,
          "quantity in same zone: ",
          maxQuantityPerZone,
          categoryAvailable
        );

        // Ajuster le nombre de places recherchées
        if (maxQuantityPerZone >= 2) {
          console.log("MULTIPLES TICKETS IN SAME ZONE");
        }

        fetch(
          "https://tickets.rolandgarros.com/api/v2/ticket/cart/ticket-products",
          {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isVoucher: false,
              priceId: categoryAvailable.priceId,
              quantity: totalQuantity || 1,
              zoneId: null,
            }),
          }
        )
          .then((res) => res.json())
          .then(console.log)
          .then(
            window.open("https://tickets.rolandgarros.com/fr/ticket/panier")
          );
      }
      return categoryAvailable || body;
    })
    .then(console.log);

setInterval(() => {
  console.log("interval");
  setTimeout(() => {
    functionBookSeat(48, "2023-06-09", 2193);
  }, Math.round(Math.random() * 10) * 1000 + 10000);

  setTimeout(() => {
    functionBookSeat(49, "2023-06-09", 2194);
  }, Math.round(Math.random() * 10) * 1000 + 10000);

  setTimeout(() => {
    functionBookSeat(42, "2023-06-11", 2181);
  }, Math.round(Math.random() * 10) * 1000 + 10000);

  setTimeout(() => {
    functionBookSeat(42, "2023-06-10", 2180);
  }, Math.round(Math.random() * 10) * 1000 + 10000);
}, 10000);
