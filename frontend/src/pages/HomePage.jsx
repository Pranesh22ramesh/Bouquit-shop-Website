import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import FAQ from '../components/FAQ';
import SeoHead from '../seo/SeoHead';
export default function HomePage() {
  const collections = [['Bouquets', '/gallery/bouquet/bouquet1.jpg', 'Flowers to give'], ['Bridal Flowers', '/gallery/bridal/flower11.jpg', 'Flowers for the ceremony'], ['Hairstyles', '/gallery/bridal/flower5.jpg', 'The finishing detail']];
  return <><SeoHead seoOverride={{ title: 'Bouquets & bridal flowers in Karur | Midhunyas Petals', description: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur. Choose a design and contact the shop about your occasion.' }} />
    <section className="page-width home-hero"><div className="hero-copy"><p className="eyebrow">THE FLOWER SHOP / KARUR</p><h1>Bouquets for a gift.<br /><em>Flowers for your wedding.</em></h1><p>Explore our bouquets, bridal flowers and garlands. Choose a design, add your preferences and speak to us about your occasion.</p><div className="button-row"><Link className="button" to="/gallery">Browse flowers <FiArrowUpRight /></Link><Link className="text-link" to="/contact">Talk to the shop</Link></div><p className="hero-note">Midhunyas Petals / Karur, Tamil Nadu</p></div><figure className="hero-photo"><img src="/gallery/bouquet/bouquet13.jpg" alt="A bouquet from the Midhunyas flower collection" width="720" height="850" fetchPriority="high" /><figcaption>FROM OUR FLOWER COLLECTION</figcaption></figure></section>
    <section className="collection-section page-width"><div className="section-heading"><div><p className="eyebrow">FIND YOUR FLOWERS</p><h2>For the occasion ahead</h2></div><Link className="text-link" to="/gallery">View all designs <FiArrowUpRight /></Link></div><div className="collection-grid">{collections.map(([name, image, caption]) => <Link key={name} className="collection-card" to={`/gallery?category=${encodeURIComponent(name)}`}><div><img src={image} alt={name} width="480" height="560" loading="lazy" onError={(event) => { event.currentTarget.src = '/gallery/bridal/flower11.jpg'; event.currentTarget.onerror = null; }} /></div><p>{caption}</p><h3>{name}<FiArrowUpRight /></h3></Link>)}</div></section>
    <section className="ordering-note"><div className="page-width"><p className="eyebrow">PLANNING AN OCCASION?</p><h2>Bring your colours.<br />Tell us what you have in mind.</h2><p>For wedding flowers or a particular arrangement, contact us to check the options and timing before you order.</p><Link className="button secondary" to="/contact">Discuss your flowers</Link></div></section>
    <div className="page-width"><FAQ /></div>
  </>;
}
