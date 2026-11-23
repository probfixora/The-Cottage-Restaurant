import { MapPin, Clock, Phone, Navigation, IndianRupee } from 'lucide-react';
import { site } from '../data/site.js';
import { useOpenStatus } from '../hooks/useOpenStatus.js';

export default function Visit() {
  const status = useOpenStatus();
  return (
    <section className="visit" id="visit" aria-labelledby="visit-title">
      <div className="container visit__grid">
        <div className="visit__info">
          <h2 className="h2" id="visit-title">
            Find us on Sultanpur Road
          </h2>
          <dl className="details">
            <div>
              <dt>
                <MapPin size={20} strokeWidth={1.6} aria-hidden="true" /> Address
              </dt>
              <dd>
                {site.addressLines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt>
                <Clock size={20} strokeWidth={1.6} aria-hidden="true" /> Hours
              </dt>
              <dd>
                <span>{site.hoursText}</span>
                <span className={`status status--inline ${status.open ? 'status--open' : 'status--closed'}`}>
                  <span className="status__dot" aria-hidden="true" />
                  {status.label}
                </span>
              </dd>
            </div>
            <div>
              <dt>
                <Phone size={20} strokeWidth={1.6} aria-hidden="true" /> Phone
              </dt>
              <dd>
                <a href={site.phoneHref}>{site.phoneDisplay}</a>
              </dd>
            </div>
            <div>
              <dt>
                <IndianRupee size={20} strokeWidth={1.6} aria-hidden="true" /> Good to know
              </dt>
              <dd>
                <span>{site.priceText}</span>
                <span>Dine in, takeaway, delivery and kerbside pickup. Free parking.</span>
              </dd>
            </div>
          </dl>
          <div className="visit__actions">
            <a className="btn btn--brass" href={site.directions} target="_blank" rel="noopener noreferrer">
              <Navigation size={17} strokeWidth={2} aria-hidden="true" /> Get directions
            </a>
            <a className="btn btn--outline" href={site.phoneHref}>
              <Phone size={17} strokeWidth={2} aria-hidden="true" /> Call us
            </a>
          </div>
        </div>
        <div className="visit__map">
          <iframe
            title="Map showing The Cottage on Sultanpur Road, Lucknow"
            src={site.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
