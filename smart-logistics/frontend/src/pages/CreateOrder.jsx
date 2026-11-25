import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Package, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const PRIORITIES = ['Standard', 'Express', 'Overnight'];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Nagpur',
];

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pickup_address: '',
    pickup_city: '',
    delivery_address: '',
    delivery_city: '',
    weight_kg: '',
    priority: 'Standard',
    notes: '',
  });
  const [items, setItems] = useState([{ description: '', quantity: 1, weight_kg: '' }]);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  }

  function handleItemChange(i, field, value) {
    setItems(it => it.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems(it => [...it, { description: '', quantity: 1, weight_kg: '' }]);
  }

  function removeItem(i) {
    if (items.length === 1) return;
    setItems(it => it.filter((_, idx) => idx !== i));
  }

  function validate() {
    const e = {};
    if (!form.pickup_address.trim()) e.pickup_address = 'Required';
    if (!form.pickup_city) e.pickup_city = 'Required';
    if (!form.delivery_address.trim()) e.delivery_address = 'Required';
    if (!form.delivery_city) e.delivery_city = 'Required';
    if (!form.weight_kg || isNaN(form.weight_kg) || Number(form.weight_kg) <= 0) e.weight_kg = 'Enter a valid weight';
    if (form.pickup_city && form.delivery_city && form.pickup_city === form.delivery_city) {
      e.delivery_city = 'Pickup and delivery city cannot be the same';
    }
    items.forEach((item, i) => {
      if (!item.description.trim()) e[`item_desc_${i}`] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        weight_kg: parseFloat(form.weight_kg),
        items: items.map(it => ({
          description: it.description,
          quantity: parseInt(it.quantity) || 1,
          weight_kg: parseFloat(it.weight_kg) || 0,
        })),
      };
      const { data } = await api.post('/orders', payload);
      toast.success(`Order created! Tracking ID: ${data.tracking_id}`);
      navigate('/app/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Shipment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to book a shipment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 text-xs flex items-center justify-center font-bold">1</span>
            Pickup Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Pickup City *</label>
              <select name="pickup_city" value={form.pickup_city} onChange={handleChange} className="input w-full">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.pickup_city && <p className="text-xs text-red-500 mt-1">{errors.pickup_city}</p>}
            </div>
            <div>
              <label className="label">Pickup Address *</label>
              <input name="pickup_address" value={form.pickup_address} onChange={handleChange} placeholder="Street address, landmark…" className="input w-full" />
              {errors.pickup_address && <p className="text-xs text-red-500 mt-1">{errors.pickup_address}</p>}
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-xs flex items-center justify-center font-bold">2</span>
            Delivery Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Delivery City *</label>
              <select name="delivery_city" value={form.delivery_city} onChange={handleChange} className="input w-full">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.delivery_city && <p className="text-xs text-red-500 mt-1">{errors.delivery_city}</p>}
            </div>
            <div>
              <label className="label">Delivery Address *</label>
              <input name="delivery_address" value={form.delivery_address} onChange={handleChange} placeholder="Street address, landmark…" className="input w-full" />
              {errors.delivery_address && <p className="text-xs text-red-500 mt-1">{errors.delivery_address}</p>}
            </div>
          </div>
        </div>

        {/* Package */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">3</span>
            Package Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Total Weight (kg) *</label>
              <input name="weight_kg" type="number" step="0.1" min="0.1" value={form.weight_kg} onChange={handleChange} placeholder="e.g. 2.5" className="input w-full" />
              {errors.weight_kg && <p className="text-xs text-red-500 mt-1">{errors.weight_kg}</p>}
            </div>
            <div>
              <label className="label">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${form.priority === p ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-400'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Special instructions, fragile items, etc." className="input w-full resize-none" />
          </div>
        </div>

        {/* Items */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Package size={18} className="text-brand-500" /> Items
            </h2>
            <button type="button" onClick={addItem} className="btn-secondary text-sm flex items-center gap-1">
              <Plus size={14} /> Add Item
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="col-span-5">
                <label className="label text-xs">Description *</label>
                <input value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} placeholder="e.g. Electronics" className="input w-full" />
                {errors[`item_desc_${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`item_desc_${i}`]}</p>}
              </div>
              <div className="col-span-3">
                <label className="label text-xs">Qty</label>
                <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} className="input w-full" />
              </div>
              <div className="col-span-3">
                <label className="label text-xs">Weight (kg)</label>
                <input type="number" step="0.1" min="0" value={item.weight_kg} onChange={e => handleItemChange(i, 'weight_kg', e.target.value)} placeholder="0.0" className="input w-full" />
              </div>
              <div className="col-span-1 flex items-end pb-1">
                <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                  className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Priority info */}
        <div className="p-4 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 text-sm text-brand-700 dark:text-brand-300">
          <strong>Estimated Delivery Time:</strong>{' '}
          {form.priority === 'Overnight' ? '1 business day' : form.priority === 'Express' ? '2-3 business days' : '5-7 business days'}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/app/orders')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <ArrowRight size={16} />}
            {loading ? 'Creating…' : 'Create Shipment'}
          </button>
        </div>
      </form>
    </div>
  );
}
