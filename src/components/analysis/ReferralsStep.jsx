import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Star, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const REQUIRED_REFERRALS = 18;

// Collect all unique names from the form data
const collectUniqueNames = (data) => {
  const names = new Set();
  
  // Housing referrals
  (data.referrals_no_own_home || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.referrals_own_home_long || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  
  // Birthday guests
  (data.birthday_family_names || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.birthday_friends_names || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.birthday_colleagues_names || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  
  // Reserve referrals
  (data.referrals_no_savings || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.referrals_has_savings || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  
  // Pension referrals
  (data.referrals_close_to_retirement || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.referrals_far_from_retirement || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  
  // Children referrals
  (data.referrals_has_children || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.referrals_recent_wedding || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  
  // Protection referrals
  (data.referrals_property_insurance || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  (data.referrals_car_insurance || []).forEach(name => {
    if (name && name.trim()) names.add(name.trim());
  });
  
  return Array.from(names);
};

export default function ReferralsStep({ data, onChange, onComplete }) {
  const [showRatingDialog, setShowRatingDialog] = useState(true);
  const [rating, setRating] = useState(null);
  const [showLowWarning, setShowLowWarning] = useState(false);
  const [referrals, setReferrals] = useState([]);

  // Initialize referrals from collected names
  useEffect(() => {
    const uniqueNames = collectUniqueNames(data);
    const initialReferrals = uniqueNames.map(name => ({
      name,
      phone: '',
      profession: '',
      married: '',
      children: '',
      mortgage: '',
      income: ''
    }));
    setReferrals(initialReferrals);
  }, []);

  const remainingCount = Math.max(0, REQUIRED_REFERRALS - referrals.length);
  const hasEnoughReferrals = referrals.length >= REQUIRED_REFERRALS;

  const handleRatingSelect = (value) => {
    setRating(value);
    setShowRatingDialog(false);
  };

  const updateReferral = (index, field, value) => {
    const updated = [...referrals];
    updated[index] = { ...updated[index], [field]: value };
    setReferrals(updated);
  };

  const addReferral = () => {
    setReferrals([...referrals, {
      name: '',
      phone: '',
      profession: '',
      married: '',
      children: '',
      mortgage: '',
      income: ''
    }]);
  };

  const removeReferral = (index) => {
    setReferrals(referrals.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Save referrals to data
    onChange('final_referrals', referrals);
    onChange('consultant_rating', rating);
    
    if (referrals.length < REQUIRED_REFERRALS && !showLowWarning) {
      setShowLowWarning(true);
      return;
    }
    
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Доколко доволни останахте от Анализа и от работата на Вашия финансов консултант?
            </DialogTitle>
          </DialogHeader>
          <div className="py-8">
            <div className="flex justify-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  onClick={() => handleRatingSelect(num)}
                  className={cn(
                    "w-12 h-12 rounded-full text-lg font-semibold transition-all",
                    num <= 3 ? "bg-red-100 hover:bg-red-200 text-red-700" :
                    num <= 6 ? "bg-amber-100 hover:bg-amber-200 text-amber-700" :
                    "bg-green-100 hover:bg-green-200 text-green-700"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-500 mt-4 px-2">
              <span>Недоволен</span>
              <span>Много доволен</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content - Only show after rating */}
      {rating !== null && (
        <>
          {/* Message based on rating */}
          <div className={cn(
            "p-6 rounded-xl border",
            rating > 7 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                rating > 7 ? "bg-green-100" : "bg-amber-100"
              )}>
                <Star className={cn("h-5 w-5", rating > 7 ? "text-green-600" : "text-amber-600")} />
              </div>
              <span className="font-semibold text-lg">Вашата оценка: {rating}/10</span>
            </div>
            
            {rating > 7 ? (
              <p className="text-slate-700">
                Благодарим Ви за положителната оценка! Доволните клиенти предоставят средно 18 имена на анализ, 
                които да послужат като гарант за достойно възнаграждение на консултанта. 
                {remainingCount > 0 && (
                  <span className="font-medium text-green-700">
                    {' '}Бихте ли могли да допълните останалите {remainingCount}?
                  </span>
                )}
              </p>
            ) : (
              <p className="text-slate-700">
                Благодарим Ви за обратната връзка. Ще се постараем да подобрим услугите си.
                {remainingCount > 0 && (
                  <span className="font-medium text-amber-700">
                    {' '}Моля, допълнете информацията за препоръките по-долу.
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Low Warning Dialog */}
          <Dialog open={showLowWarning} onOpenChange={setShowLowWarning}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-amber-600">Недостатъчен брой препоръки</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-700">
                  Работата на консултантите се оценява в частност от броя препоръки, които получават на анализ. 
                  Ниското ниво препоръки ще доведе до лоша оценка на консултанта в системата ни.
                </p>
                <p className="font-medium text-amber-700 mt-3">
                  Бихте ли могли да допълните останалите {remainingCount}?
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setShowLowWarning(false);
                  onComplete();
                }}>
                  Продължи без допълване
                </Button>
                <Button onClick={() => setShowLowWarning(false)} className="bg-blue-600 hover:bg-blue-700">
                  Ще допълня
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Referrals Table */}
          <div className="bg-slate-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Препоръки ({referrals.length}/{REQUIRED_REFERRALS})
                </h3>
              </div>
              <Button onClick={addReferral} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Добави
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    hasEnoughReferrals ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min(100, (referrals.length / REQUIRED_REFERRALS) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {hasEnoughReferrals 
                  ? "✓ Достигнахте препоръчителния брой препоръки!" 
                  : `Остават още ${remainingCount} препоръки до целта`
                }
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-3 py-2 font-medium text-slate-700">Име и Фамилия</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-700">Телефон</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-700">Професия/Дейност</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-700">Семеен</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-700">Деца</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-700">Ипотека</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-700">Месечен доход</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {referrals.map((ref, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-2 py-2">
                        <Input
                          value={ref.name}
                          onChange={(e) => updateReferral(index, 'name', e.target.value)}
                          placeholder="Име Фамилия"
                          className="h-9 text-sm"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={ref.phone}
                          onChange={(e) => updateReferral(index, 'phone', e.target.value)}
                          placeholder="+359..."
                          className="h-9 text-sm"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={ref.profession}
                          onChange={(e) => updateReferral(index, 'profession', e.target.value)}
                          placeholder="Професия"
                          className="h-9 text-sm"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Select value={ref.married} onValueChange={(val) => updateReferral(index, 'married', val)}>
                          <SelectTrigger className="h-9 w-16">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Не</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Select value={ref.children} onValueChange={(val) => updateReferral(index, 'children', val)}>
                          <SelectTrigger className="h-9 w-16">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Не</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Select value={ref.mortgage} onValueChange={(val) => updateReferral(index, 'mortgage', val)}>
                          <SelectTrigger className="h-9 w-16">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Не</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={ref.income}
                          onChange={(e) => updateReferral(index, 'income', e.target.value)}
                          placeholder="€"
                          className="h-9 text-sm w-24"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReferral(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {referrals.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Няма добавени препоръки. Натиснете "Добави" за да започнете.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              Завърши анализа
            </Button>
          </div>
        </>
      )}
    </div>
  );
}