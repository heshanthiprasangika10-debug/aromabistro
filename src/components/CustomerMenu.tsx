import React, { useState, useMemo } from 'react';
import {
  Search,
  Flame,
  Clock,
  Star,
  Plus,
  Minus,
  Sparkles,
  Info,
  Check,
  X,
  Share2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem } from '../types';

interface CustomerMenuProps {
  onOpenOrderTracker: () => void;
  onOpenChat: () => void;
  onOpenLoyalty: () => void;
  onOpenSocial: () => void;
  onOpenReservation: () => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  onOpenOrderTracker,
  onOpenChat,
  onOpenLoyalty,
  onOpenSocial,
  onOpenReservation
}) => {
  const { menu, addToCart, activeOrder, orderType, selectedTable, sendMessage } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);

  // Selected dish for customizer modal
  const [activeDish, setActiveDish] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpice, setSelectedSpice] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [cookingNotes, setCookingNotes] = useState('');
  const [tableCallSent, setTableCallSent] = useState(false);

  const categories = ['All', 'Specials', 'Kottu & Roti', 'Curries & Rice', 'Mains', 'Appetizers', 'Beverages', 'Desserts'];

  const filteredItems = useMemo(() => {
    return menu.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameSi && item.nameSi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Specials'
          ? item.badge !== undefined
          : item.category === selectedCategory;

      const matchesVeg = vegetarianOnly ? item.isVegetarian : true;
      const matchesSpicy = spicyOnly ? item.spicyLevel > 0 : true;

      return matchesSearch && matchesCat && matchesVeg && matchesSpicy;
    });
  }, [menu, searchQuery, selectedCategory, vegetarianOnly, spicyOnly]);

  const handleOpenCustomizer = (item: MenuItem) => {
    setActiveDish(item);
    setQuantity(1);
    setSelectedSpice(item.spicyLevel);
    setSelectedAddons([]);
    setCookingNotes('');
  };

  const handleAddToCartFromModal = () => {
    if (!activeDish) return;
    const notesArray: string[] = [];
    if (selectedSpice !== activeDish.spicyLevel) {
      const spiceLevels = ['No Spice', 'Mild', 'Medium Hot', 'Extra Fiery'];
      notesArray.push(`Spice: ${spiceLevels[selectedSpice]}`);
    }
    if (cookingNotes.trim()) {
      notesArray.push(cookingNotes.trim());
    }
    addToCart(activeDish, quantity, notesArray.join(' | '), selectedAddons);
    setActiveDish(null);
  };

  const handleCallWaiter = (reason: string) => {
    sendMessage(`Table ${selectedTable} request: ${reason}`, 'customer', selectedTable);
    setTableCallSent(true);
    setTimeout(() => setTableCallSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gourmet Fusion Dining & Artisanal Ceylon Flavors</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif leading-tight">
              Freshly Prepared Delights, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                Crafted to Perfection.
              </span>
            </h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-xl">
              Order directly to Table {orderType === 'dine-in' ? selectedTable : `(${orderType})`}.
              Enjoy live order tracking, chef-curated specials, instant loyalty points, and personalized AI assistance.
            </p>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={onOpenReservation}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-orange-950/40"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve a Table</span>
              </button>
              <button
                onClick={onOpenChat}
                className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask AromaBot AI</span>
              </button>
              <button
                onClick={onOpenLoyalty}
                className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <span>AromaRewards Club</span>
              </button>
              <button
                onClick={onOpenSocial}
                className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Share & Win Discount</span>
              </button>
            </div>
          </div>

          {/* Table Service Callout */}
          {orderType === 'dine-in' && (
            <div className="w-full md:w-auto bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs text-stone-400">Current Dining Location</span>
                  <div className="text-xl font-bold text-amber-400">Table {selectedTable}</div>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" title="Service Connected" />
              </div>

              <div className="text-xs text-stone-400 mb-2 font-medium">Quick Waiter Request:</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleCallWaiter('Water Refill')}
                  className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-[11px] font-medium rounded-lg text-stone-300 border border-stone-700/60 transition cursor-pointer"
                >
                  💧 Water
                </button>
                <button
                  onClick={() => handleCallWaiter('Extra Cutlery & Napkins')}
                  className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-[11px] font-medium rounded-lg text-stone-300 border border-stone-700/60 transition cursor-pointer"
                >
                  🍴 Cutlery
                </button>
                <button
                  onClick={() => handleCallWaiter('Request Bill')}
                  className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-[11px] font-medium rounded-lg text-stone-300 border border-stone-700/60 transition cursor-pointer"
                >
                  🧾 Bill
                </button>
              </div>

              {tableCallSent && (
                <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40 text-center font-medium">
                  ✓ Waiter notified! Coming to Table {selectedTable}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Live Order Banner if Active Order exists */}
      {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div
            onClick={onOpenOrderTracker}
            className="bg-gradient-to-r from-amber-900/60 via-orange-950/60 to-stone-900 border border-amber-600/50 rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer hover:border-amber-500 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">Live Order #{activeOrder.orderNumber}</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  {activeOrder.items.length} items • Total: ${activeOrder.total.toFixed(2)} • Tap to view live kitchen tracking
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition">
              Track Order →
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Kottu, Crab Curry, Burgers, Truffle Pizza..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dietary toggle chips */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVegetarianOnly(!vegetarianOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                vegetarianOnly
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                spicyOnly
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Spicy</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-4 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                    : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/50 rounded-2xl border border-stone-800">
            <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No dishes found matching your criteria</h3>
            <p className="text-xs text-stone-400 mt-1">Try resetting the filters or searching for something else.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setVegetarianOnly(false);
                setSpicyOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(dish => (
              <div
                key={dish.id}
                className={`group bg-stone-900/90 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 ${
                  dish.isAvailable ? 'border-stone-800 hover:border-amber-500/50' : 'border-stone-800 opacity-60'
                }`}
              >
                {/* Dish Card Header & Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-800">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />

                  {/* Badge */}
                  {dish.badge && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-black text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full shadow-md">
                      {dish.badge}
                    </div>
                  )}

                  {!dish.isAvailable && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow">
                        Sold Out (86'd)
                      </span>
                    </div>
                  )}

                  {/* Prep time & rating */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-stone-200 font-medium">
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{dish.prepTime}m</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{dish.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-stone-400">({dish.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Dish Information */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition leading-snug">
                        {dish.name}
                      </h3>
                    </div>

                    {dish.nameSi && (
                      <p className="text-[11px] text-amber-300/80 font-medium mb-1.5 font-sans">
                        {dish.nameSi}
                      </p>
                    )}

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
                      {dish.description}
                    </p>
                  </div>

                  {/* Attributes & Price Bar */}
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] text-stone-400 mb-3">
                      {/* Spicy indicators */}
                      {dish.spicyLevel > 0 && (
                        <span className="flex items-center text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded">
                          <Flame className="w-3 h-3 mr-0.5" />
                          {'🌶️'.repeat(dish.spicyLevel)}
                        </span>
                      )}

                      {/* Veg indicator */}
                      {dish.isVegetarian && (
                        <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                          🌱 Veg
                        </span>
                      )}

                      <span className="text-stone-500">{dish.calories} kcal</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                      <div>
                        <span className="text-xs text-stone-400">Price: </span>
                        <span className="text-base sm:text-lg font-extrabold text-white">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        disabled={!dish.isAvailable}
                        onClick={() => handleOpenCustomizer(dish)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition cursor-pointer shadow-sm ${
                          dish.isAvailable
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Customize</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Dish Customizer Modal */}
      {activeDish && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Header Image */}
            <div className="relative h-44 w-full shrink-0">
              <img src={activeDish.image} alt={activeDish.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setActiveDish(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-xl font-bold text-white">{activeDish.name}</h3>
                {activeDish.nameSi && <p className="text-xs text-amber-300 font-sans">{activeDish.nameSi}</p>}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-stone-300">
              <p className="text-stone-300 leading-relaxed">{activeDish.description}</p>

              {/* Allergens warning */}
              {activeDish.allergens && activeDish.allergens.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-amber-200">
                    <strong>Allergens:</strong> Contains {activeDish.allergens.join(', ')}.
                  </span>
                </div>
              )}

              {/* Spice Level Adjustment */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">Select Spice Preference:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { level: 0, label: 'Mild / None' },
                    { level: 1, label: 'Authentic 🌶️' },
                    { level: 2, label: 'Medium 🌶️🌶️' },
                    { level: 3, label: 'Extra Fiery 🔥' }
                  ].map(s => (
                    <button
                      key={s.level}
                      type="button"
                      onClick={() => setSelectedSpice(s.level)}
                      className={`p-2 rounded-xl text-center border font-semibold text-[11px] transition cursor-pointer ${
                        selectedSpice === s.level
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons & Extras */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">Optional Extras & Add-ons:</label>
                <div className="space-y-1.5">
                  {[
                    { name: 'Extra Molten Mozzarella Cheese', price: 2.00 },
                    { name: 'Add Fried Egg on Top', price: 1.00 },
                    { name: 'Double Portion Portion Pack', price: 4.50 },
                    { name: 'Side of Spicy Kochchi Sambol', price: 1.50 }
                  ].map(addon => {
                    const isSelected = selectedAddons.includes(addon.name);
                    return (
                      <div
                        key={addon.name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAddons(prev => prev.filter(a => a !== addon.name));
                          } else {
                            setSelectedAddons(prev => [...prev, addon.name]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-white'
                            : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-500 text-white' : 'border-stone-600'}`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="font-medium text-xs">{addon.name}</span>
                        </div>
                        <span className="font-bold text-amber-400 text-xs">+${addon.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Special Instructions for Chef:</label>
                <input
                  type="text"
                  value={cookingNotes}
                  onChange={e => setCookingNotes(e.target.value)}
                  placeholder="e.g. Less oil, separate gravy, no onions..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Footer with Quantity and Add Button */}
            <div className="p-4 border-t border-stone-800 bg-stone-900 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 bg-stone-800 rounded-xl p-1.5 border border-stone-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-stone-700 hover:bg-stone-600 text-white flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-white px-1">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-stone-700 hover:bg-stone-600 text-white flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCartFromModal}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-950/40 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Add to Tray</span>
                <span>•</span>
                <span>${(activeDish.price * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
