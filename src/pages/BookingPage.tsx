import { useState } from 'react';
import { Send, CheckCircle, Mail } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  concernedArtist: string;
  message: string;
}

export default function BookingPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'booking-artist',
    concernedArtist: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/submit-contact`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: 'booking-artist',
          concernedArtist: '',
          message: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            BOOKING
          </h1>
          <p className="text-gray-400 tracking-wide max-w-2xl mx-auto">
            Intéressé par un booking artiste ou par le collectif RÜMBL ? Remplissez le formulaire
            ci-dessous et nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-red-500/30 rounded-lg p-8 md:p-12 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
              <h2 className="text-3xl font-bold mb-4 tracking-wider">MESSAGE ENVOYÉ</h2>
              <p className="text-gray-400">
                Merci pour votre message. Nous vous répondrons rapidement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-bold tracking-wider mb-2">
                    PRÉNOM *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500"
                    placeholder="Votre prénom"
                    aria-required="true"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <div id="firstName-error" className="error-message" role="alert">
                      {errors.firstName}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-bold tracking-wider mb-2">
                    NOM *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500"
                    placeholder="Votre nom"
                    aria-required="true"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <div id="lastName-error" className="error-message" role="alert">
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold tracking-wider mb-2">
                  EMAIL *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500"
                  placeholder="votre.email@exemple.com"
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <div id="email-error" className="error-message" role="alert">
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-bold tracking-wider mb-2">
                  SUJET *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500"
                >
                  <option value="booking-artist">Booking artiste</option>
                  <option value="booking-collective">Booking collectif RÜMBL</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="concernedArtist" className="block text-sm font-bold tracking-wider mb-2">
                  ARTISTE OU PROJET CONCERNÉ
                </label>
                <input
                  type="text"
                  id="concernedArtist"
                  name="concernedArtist"
                  value={formData.concernedArtist}
                  onChange={handleChange}
                  className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500"
                  placeholder="Nom de l'artiste ou du projet (optionnel)"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold tracking-wider mb-2">
                  MESSAGE *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none placeholder-gray-500"
                  placeholder="Décrivez votre demande en détail..."
                  aria-required="true"
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                  <div id="message-error" className="error-message" role="alert">
                    {errors.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold tracking-wider py-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
                aria-busy={isSubmitting}
                aria-live="polite"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    ENVOI EN COURS...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-3" />
                    ENVOYER LE MESSAGE
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-center text-gray-400 text-sm">
              <Mail size={18} className="mr-2" />
              <span>Rumbl.techno@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
