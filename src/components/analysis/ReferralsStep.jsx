import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Star, CheckCircle } from 'lucide-react';
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

const REQUIRED_REFERRALS = 18;

export default function ReferralsStep({ data, onChange, onComplete, existingNames = [] }) {
  const [showRatingDialog, setShowRatingDialog] = useState(true);
  const [rating, setRating] = useState(null);
  const [showLowReferralsWarning, setShowLowReferralsWarning] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [referrals, setReferrals] = useState([]);

  // Initialize referrals from existing names
  useEffect(() => {
    const initialReferrals = existingNames.map(name => ({
      name: name,
      phone: '',
      profession: '',
      is_married: '',
      has_children: '',
      has_mortgage: '',
      monthly_income: ''
    }));
    
    // Add empty rows to reach at least some starting point
    while (initialReferrals.length < Math.max(existingNames.length + 5, 10)) {
      initialReferrals.push({
        name: '',
        phone: '',
        profession: '',
        is_married: '',
        has_children: '',
        has_mortgage: '',
        monthly_income: ''
      });
    }
    
    setReferrals(initialReferrals);
  }, [existingNames]);

  const filledReferrals = referrals.filter(r => r.name && r.name.trim() !== '');
  const remainingCount = Math.max(0, REQUIRED_REFERRALS - filledReferrals.length);

  const handleRatingSelect = (value) => {
    setRating(value);
    setShowRatingDialog(false);
  };

  const handleReferralChange = (index, field, value) => {
    const newReferrals = [...referrals];
    newReferrals[index] = { ...newReferrals[index], [field]: value };
    setReferrals(newReferrals);
    
    // Add new empty row if last row is being filled
    if (index === referrals.length - 1 && value && field === 'name') {
      newReferrals.push({
        name: '',
        phone: '',
        profession: '',
        is_married: '',
        has_children: '',
        has_mortgage: '',
        monthly_income: ''
      });
      setReferrals(newReferrals);
    }
  };

  const handleSubmit = () => {
    const filled = referrals.filter(r => r.name && r.name.trim() !== '');
    
    if (filled.length < REQUIRED_REFERRALS && !showLowReferralsWarning) {
      setShowLowReferralsWarning(true);
      return;
    }
    
    // Save referrals to form data
    onChange('final_referrals', filled);
    setShowThankYouDialog(true);
  };

  const handleComplete = () => {
    setShowThankYouDialog(false);
    onComplete();
  };

  // Rating Dialog
  if (showRatingDialog) {
    return (
      <Dialog open={showRatingDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Оценка на анализа</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center text-slate-700 mb-6">
              Доколко доволни останахте от Анализа и от работата на Вашия финансов консултант?
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRatingSelect(num)}
                  className={`w-12 h-12 rounded-full border-2 font-semibold transition-all hover:scale-110 ${
                    num <= 4 ? 'border-red-300 text-red-600 hover:bg-red-50' :
                    num <= 7 ? 'border-amber-300 text-amber-600 hover:bg-amber-50' :
                    'border-green-300 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-3 px-2">
              <span>Недоволен</span>
              <span>Много доволен</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Thank You Dialog
  if (showThankYouDialog) {
    return (
      <Dialog open={showThankYouDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" hideCloseButton>
          <div className="py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Благодарим Ви!
            </h2>
            <p className="text-slate-600 mb-8">
              Благодарим Ви за предоставените препоръки и за доверието! 
              Вашият финансов план ще бъде изготвен в най-кратък срок.
            </p>
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 rounded-full px-8"
            >
              Завърши
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Low Referrals Warning Dialog
  if (showLowReferralsWarning && filledReferrals.length < REQUIRED_REFERRALS) {
    return (
      <Dialog open={showLowReferralsWarning} onOpenChange={setShowLowReferralsWarning}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Недостатъчен брой препоръки</DialogTitle>
          </DialogHeader>
          <div className="py-4 bg-red-50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
            <p className="text-slate-700 mb-6">
              Работата на консултантите се оценява в частност от броя препоръки, които получават на анализ. 
              Ниското ниво препоръки ще доведе до лоша оценка на консултанта в системата ни. 
              Бихте ли могли да допълните останалите <span className="font-bold text-red-600">{remainingCount}</span> имена?
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  onChange('final_referrals', filledReferrals);
                  setShowLowReferralsWarning(false);
                  setShowThankYouDialog(true);
                }}
              >
                Продължи без допълване
              </Button>
              <Button 
                onClick={() => setShowLowReferralsWarning(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ще допълня
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Star className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            {rating > 7 ? (
              <p className="text-blue-800">
                Благодарим Ви за положителната оценка! Доволните клиенти предоставят средно 18 имена на анализ, 
                които да послужат като гарант за достойно възнаграждение на консултанта. 
                {remainingCount > 0 && (
                  <span className="font-semibold"> Бихте ли могли да допълните останалите {remainingCount}?</span>
                )}
              </p>
            ) : (
              <p className="text-blue-800">
                Благодарим Ви за обратната връзка! Моля, допълнете информацията за препоръките по-долу.
                {remainingCount > 0 && (
                  <span className="font-semibold"> Остават {remainingCount} имена до препоръчителния брой от 18.</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between bg-slate-100 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-600" />
          <span className="font-medium text-slate-700">Попълнени препоръки:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${filledReferrals.length >= REQUIRED_REFERRALS ? 'text-green-600' : 'text-amber-600'}`}>
            {filledReferrals.length}
          </span>
          <span className="text-slate-500">/ {REQUIRED_REFERRALS}</span>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm font-medium text-slate-700 px-3 py-3 w-8">#</th>
                <th className="text-left text-sm font-medium text-slate-700 px-3 py-3">Име и Фамилия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrals.map((referral, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-sm text-slate-500">{index + 1}</td>
                  <td className="px-3 py-2">
                    <Input
                      value={referral.name}
                      onChange={(e) => handleReferralChange(index, 'name', e.target.value)}
                      placeholder="Име Фамилия"
                      className="h-9 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 rounded-full px-8"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Завърши анализа
        </Button>
      </div>
    </div>
  );
}