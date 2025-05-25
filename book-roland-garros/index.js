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

// Improved randomization functions
const getRandomDelay = (baseMs, variationMs, strategy = "uniform") => {
  switch (strategy) {
    case "exponential":
      // Exponential distribution for more natural timing
      return baseMs + Math.floor(-Math.log(Math.random()) * variationMs);

    case "normal":
      // Approximate normal distribution using Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.max(baseMs, baseMs + z0 * (variationMs / 3));

    case "uniform":
    default:
      // Original uniform distribution but with better range
      return baseMs + Math.floor(Math.random() * variationMs);
  }
};

const getJitteredInterval = (baseInterval) => {
  // Add ±20% jitter to the base interval to avoid predictable patterns
  const jitterRange = baseInterval * 0.4; // 40% total range (±20%)
  const jitter = (Math.random() - 0.5) * jitterRange;
  return Math.max(5000, baseInterval + jitter); // Minimum 5 seconds
};

const getRandomStrategy = () => {
  const strategies = ["uniform", "exponential", "normal"];
  return strategies[Math.floor(Math.random() * strategies.length)];
};

const intervalInMs = 30000;

logWithTimestamp(
  `🚀 Starting Roland Garros booking bot with ${
    intervalInMs / 1000
  }s base intervals`
);

setInterval(() => {
  logWithTimestamp("🔄 Starting new booking attempt cycle");

  // Use jittered interval for the main cycle timing
  const currentInterval = getJitteredInterval(intervalInMs);

  // Enhanced randomization for the active booking attempt
  const strategy = getRandomStrategy();
  const baseDelay = intervalInMs;
  const maxVariation = 20000; // Up to 20 seconds variation
  const randomDelay = getRandomDelay(baseDelay, maxVariation, strategy);

  // Add additional micro-jitter (100-2000ms) to make timing less predictable
  const microJitter = 100 + Math.random() * 1900;
  const finalDelay = randomDelay + microJitter;

  logWithTimestamp(
    `⏰ Scheduling check for 2025-05-26 in ${(finalDelay / 1000).toFixed(
      2
    )}s (strategy: ${strategy}, base: ${baseDelay / 1000}s, variation: ${
      (randomDelay - baseDelay) / 1000
    }s, jitter: ${microJitter.toFixed(0)}ms)`
  );

  // setTimeout(() => {
  //   // Demi finale 1
  //   functionBookSeat(48, "2025-06-06", 2602);
  // }, finalDelay);

  // setTimeout(() => {
  //   // Demi finale 2
  //   functionBookSeat(49, "2025-06-06", 2603);
  // }, finalDelay);

  // setTimeout(() => {
  //   // Finale
  //   functionBookSeat(42, "2025-06-08", 2618);
  // }, finalDelay);

  setTimeout(() => {
    // Annexes 27 Mai
    // functionBookSeat2("2025-05-26");
  }, finalDelay);
}, intervalInMs);
