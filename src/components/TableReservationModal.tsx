import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  X,
  Printer,
  CalendarCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { SeatingArea, SpecialOccasion, TableReservation } from '../types';

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableReservationModal: React.FC<TableReservationModalProps> = ({ isOpen, onClose }) => {
  const { createReservation, playChime } = useRestaurant();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [time, setTime] = useState('19:30');
  const [partySize, setPartySize] = useState(2);
  const [seatingArea, setSeatingArea] = useState<SeatingArea>('Window View');
  const [specialOccasion, setSpecialOccasion] = useState<SpecialOccasion>('None');
  const [specialRequests, setSpecialRequests] = useState('');
  const [customerName, setCustomerName] = useState('Heshanthi');
  const [customerPhone, setCustomerPhone] = useState('+94 77 123 4567');
  const [customerEmail, setCustomerEmail] = useState('heshanthiprasangika10@gmail.com');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);

  if (!isOpen) return null;

  const lunchSlots = ['12:00', '12:30', '13:00', '13:30', '14:00'];
  const dinnerSlots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  const seatingOptions: { area: SeatingArea; desc: string; icon: string }[] = [
    { area: 'Window View', desc: 'Marine Drive ocean breeze & panoramic views', icon: '🪟' },
    { area: 'Outdoor Garden Terrace', desc: 'Tropical open-air courtyard with fairy lights', icon: '🌿' },
    { area: 'Chef VIP Lounge', desc: 'Private intimate booths with dedicated sommelier', icon: '🍷' },
    { area: 'Indoor Dining', desc: 'Artisanal bistro ambiance with open grill views', icon: '🍽️' }
  ];

  const occasions: SpecialOccasion[] = [
    'None',
    'Birthday',
    'Anniversary',
    'Date Night',
    'Business Dinner',
    'Celebration'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    try {
      const res = await createReservation({
        customerName,
        customerPhone,
        customerEmail,
        date,
        time,
        partySize,
        seatingArea,
        specialOccasion,
        specialRequests
      });

      playChime();
      setConfirmedReservation(res);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden text-stone-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">Table Reservation</h3>
              <p className="text-xs text-stone-400">Reserve your dining experience at AromaBistro</p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmedReservation(null);
              onClose();
            }}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!confirmedReservation ? (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* 1. Date Selection */}
            <div>
              <label className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Select Dining Date</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDate(today)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                    date === today
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                  }`}
                >
                  Today ({new Date(today).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                </button>
                <button
                  type="button"
                  onClick={() => setDate(tomorrow)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                    date === tomorrow
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                  }`}
                >
                  Tomorrow ({new Date(tomorrow).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                </button>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Party Size */}
            <div>
              <label className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Number of Guests (Party Size)</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPartySize(num)}
                    className={`py-2 rounded-xl font-bold transition cursor-pointer ${
                      partySize === num
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                    }`}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Time Slots */}
            <div>
              <label className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Select Preferred Dining Time</span>
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                    Lunch Service
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lunchSlots.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`px-3 py-1.5 rounded-xl font-mono font-semibold transition cursor-pointer ${
                          time === t
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                    Dinner Service
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dinnerSlots.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`px-3 py-1.5 rounded-xl font-mono font-semibold transition cursor-pointer ${
                          time === t
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Seating Area */}
            <div>
              <label className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Choose Atmosphere & Seating Area</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {seatingOptions.map(opt => (
                  <div
                    key={opt.area}
                    onClick={() => setSeatingArea(opt.area)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-start space-x-2.5 ${
                      seatingArea === opt.area
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xl shrink-0">{opt.icon}</span>
                    <div>
                      <div className="font-bold text-white">{opt.area}</div>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Special Occasion */}
            <div>
              <label className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Celebrating a Special Occasion?</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {occasions.map(occ => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setSpecialOccasion(occ)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                      specialOccasion === occ
                        ? 'bg-amber-600 text-white shadow font-bold'
                        : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                    }`}
                  >
                    {occ === 'Birthday' ? '🎂 Birthday' : occ === 'Anniversary' ? '💍 Anniversary' : occ === 'Date Night' ? '🥂 Date Night' : occ}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Guest Contact & Special Requests */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                6. Guest Details & Confirmation
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Email for Instant Confirmation</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Special Dietary / Seating Requests</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="e.g. High chair needed, allergy to peanuts, quiet table..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-orange-950/40 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Securing Table...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirm Table Reservation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white font-serif">Table Reservation Confirmed!</h3>
              <p className="text-xs text-stone-400">
                We look forward to hosting you at AromaBistro.
              </p>
            </div>

            {/* Official Confirmation Card */}
            <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-dashed border-stone-800 pb-3">
                <span className="text-stone-400">Reservation Code:</span>
                <span className="text-lg font-black text-amber-400">{confirmedReservation.reservationCode}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-300">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Guest Name</span>
                  <span className="font-bold text-white">{confirmedReservation.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Party Size</span>
                  <span className="font-bold text-white">{confirmedReservation.partySize} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Date</span>
                  <span className="font-bold text-white">{confirmedReservation.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Time Slot</span>
                  <span className="font-bold text-amber-400">{confirmedReservation.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Atmosphere</span>
                  <span className="font-bold text-white">{confirmedReservation.seatingArea}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Occasion</span>
                  <span className="font-bold text-white">{confirmedReservation.specialOccasion || 'Standard'}</span>
                </div>
              </div>

              {confirmedReservation.specialRequests && (
                <div className="pt-2 border-t border-dashed border-stone-800 text-[11px] text-amber-300">
                  <span>Note: {confirmedReservation.specialRequests}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                📧 Confirmation email sent to <span className="text-white font-sans">{confirmedReservation.customerEmail}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => {
                  setConfirmedReservation(null);
                  onClose();
                }}
                className="flex-1 py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md"
              >
                <span>Done</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
