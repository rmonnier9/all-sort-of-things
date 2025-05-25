const getQuantityInfoForCategoryId = (categoryId, stadium) => {
  let totalQuantity = 0;
  let maxQuantityPerZone = 0;

  if (!stadium.zoneCoordinates) {
    return { totalQuantity: 1, maxQuantityPerZone: 1 };
  }

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

const logWithTimestamp = (message, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]`, message, ...args);
};

const functionBookSeat = (offerId, date, sessionId) => {
  logWithTimestamp(
    `🎯 Attempting to book seat - Offer: ${offerId}, Date: ${date}, Session: ${sessionId}`
  );

  return fetch(
    `https://tickets.rolandgarros.com/api/v2/fr/ticket/category/page/offer/${offerId}/date/${date}/sessions/${sessionId}`,
    {}
  )
    .then((res) => {
      logWithTimestamp(`📡 API response received for session ${sessionId}`);
      return res.json();
    })
    .then((body) => {
      const categoryAvailable = body.categories.find(
        (category) => category.hasStock === true
      );

      if (!categoryAvailable) {
        logWithTimestamp(
          `❌ No tickets available for session ${sessionId} on ${date}`
        );
        return {
          success: false,
          reason: "No tickets available",
          sessionId,
          date,
        };
      } else {
        const { totalQuantity, maxQuantityPerZone } =
          getQuantityInfoForCategoryId(categoryAvailable.id, body.stadium);

        logWithTimestamp(
          `✅ TICKETS FOUND! Session: ${sessionId}, Price: €${categoryAvailable.price}, Total quantity: ${totalQuantity}, Max per zone: ${maxQuantityPerZone}`
        );

        // Ajuster le nombre de places recherchées
        if (maxQuantityPerZone >= 2) {
          logWithTimestamp("🎉 MULTIPLE TICKETS AVAILABLE IN SAME ZONE!");
        }

        logWithTimestamp(`🛒 Adding tickets to cart...`);

        return fetch(
          "https://tickets.rolandgarros.com/api/v2/ticket/cart/ticket-products",
          {
            method: "POST",
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
          .then((cartResult) => {
            logWithTimestamp(`🛒 Cart API response:`, cartResult);
            logWithTimestamp(`🌐 Opening cart page...`);
            window.open("https://tickets.rolandgarros.com/fr/ticket/panier");
            return {
              success: true,
              cartResult,
              categoryAvailable,
              sessionId,
              date,
            };
          })
          .catch((error) => {
            logWithTimestamp(`❌ Error adding to cart:`, error);
            return {
              success: false,
              reason: "Cart error",
              error,
              sessionId,
              date,
            };
          });
      }
    })
    .catch((error) => {
      logWithTimestamp(`❌ API error for session ${sessionId}:`, error);
      return { success: false, reason: "API error", error, sessionId, date };
    })
    .then((result) => {
      logWithTimestamp(`📋 Final result for session ${sessionId}:`, result);
      return result;
    });
};

const functionBookSeat2 = (date) => {
  logWithTimestamp(`🔍 Searching for available offers on ${date}`);

  return fetch(
    `https://tickets.rolandgarros.com/api/v2/fr/ticket/calendar/offers-grouped-by-sorted-offer-type/${date}`,
    {}
  )
    .then((res) => {
      logWithTimestamp(`📡 Calendar API response received for ${date}`);
      return res.json();
    })
    .then((body) => {
      const offerAvailable = body[0].offers.find(
        (offer) => offer.isAvailable === true
      );

      if (!offerAvailable) {
        logWithTimestamp(`❌ No offers available on ${date}`);
        return { success: false, reason: "No offers available", date };
      } else {
        const offerId = offerAvailable.offerId;
        const sessionId = offerAvailable.sessionIds[0];
        logWithTimestamp(
          `✅ Offer found on ${date}! Offer ID: ${offerId}, Session ID: ${sessionId}`
        );
        return functionBookSeat(offerId, date, sessionId);
      }
    })
    .catch((error) => {
      logWithTimestamp(`❌ Calendar API error for ${date}:`, error);
      return { success: false, reason: "Calendar API error", error, date };
    });
};

const intervalInMs = 30000;

logWithTimestamp(
  `🚀 Starting Roland Garros booking bot with ${intervalInMs / 1000}s intervals`
);

setInterval(() => {
  logWithTimestamp("🔄 Starting new booking attempt cycle");

  // setTimeout(() => {
  //   // Demi finale 1
  //   functionBookSeat(48, "2025-06-06", 2602);
  // }, Math.round(Math.random() * 10) * 1000 + 10000);

  // setTimeout(() => {
  //   // Demi finale 2
  //   functionBookSeat(49, "2025-06-06", 2603);
  // }, Math.round(Math.random() * 10) * 1000 + 10000);

  // setTimeout(() => {
  //   // Finale
  //   functionBookSeat(42, "2025-06-08", 2618);
  // }, Math.round(Math.random() * 10) * 1000 + intervalInMs);

  const randomDelay = Math.round(Math.random() * 10) * 1000 + intervalInMs;
  logWithTimestamp(
    `⏰ Scheduling check for 2025-05-26 in ${randomDelay / 1000}s`
  );

  setTimeout(() => {
    // Annexes 27 Mai
    // functionBookSeat2("2025-05-26");
  }, randomDelay);
}, intervalInMs);
