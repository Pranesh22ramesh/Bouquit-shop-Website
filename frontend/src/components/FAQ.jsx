import React from 'react';
export default function FAQ() {
  const items = [
    ['How do I place an order?', 'Choose an available design, select its options and add it to your cart. Sign in to enter your address and submit your order. You can follow its status in My orders.'],
    ['Can I request different colours or flowers?', 'Use the options shown on the product page and add a note about your request. Contact the shop to check any arrangements outside the listed options.'],
    ['Can I choose a delivery date?', 'You can request a date at checkout. Contact the shop to confirm availability and delivery arrangements before relying on a particular time.'],
    ['How do I change or cancel an order?', 'Contact the shop with your order number as soon as possible. Changes, cancellations and any refund depend on the order arrangements agreed with the shop.'],
  ];
  return <section className="faq-section" aria-labelledby="faq-title"><div><p className="eyebrow">Before you order</p><h2 id="faq-title">A few useful answers</h2><p>For a specific occasion, speak to us about what you need.</p></div><div>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>;
}
