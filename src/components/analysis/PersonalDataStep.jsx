import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User, Users, Baby } from 'lucide-react';

// Helper function to calculate age from birthdate
const calculateAge = (birthdate) => {
  if (!birthdate) return '';
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function PersonalDataStep({ data, onChange }) {
  // Auto-calculate client age when birthdate changes
  useEffect(() => {
    if (data.client_birthdate) {
      const age = calculateAge(data.client_birthdate);
      if (age !== data.client_age) {
        onChange('client_age', age);
      }
    }
  }, [data.client_birthdate]);

  // Auto-calculate partner age when birthdate changes
  useEffect(() => {
    if (data.partner_birthdate) {
      const age = calculateAge(data.partner_birthdate);
      if (age !== data.partner_age) {
        onChange('partner_age', age);
      }
    }
  }, [data.partner_birthdate]);

  return (
    <div className="space-y-8">
      {/* Client Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Клиент</h3>
        </div>
        
        {/* Personal Info */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Име</Label>
            <Input
              placeholder="Иван"
              value={data.client_first_name || ''}
              onChange={(e) => onChange('client_first_name', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Презиме</Label>
            <Input
              placeholder="Петров"
              value={data.client_middle_name || ''}
              onChange={(e) => onChange('client_middle_name', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Фамилия</Label>
            <Input
              placeholder="Георгиев"
              value={data.client_last_name || ''}
              onChange={(e) => onChange('client_last_name', e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Дата на раждане</Label>
            <Input
              type="date"
              value={data.client_birthdate || ''}
              onChange={(e) => onChange('client_birthdate', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Възраст (автоматично)</Label>
            <Input
              type="number"
              value={data.client_age || ''}
              readOnly
              className="rounded-lg bg-slate-100"
            />
          </div>
          <div className="space-y-2">
            <Label>Пол</Label>
            <Select 
              value={data.client_gender || ''} 
              onValueChange={(value) => onChange('client_gender', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Мъж</SelectItem>
                <SelectItem value="female">Жена</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Място на раждане</Label>
            <Input
              placeholder="гр. София"
              value={data.client_birthplace || ''}
              onChange={(e) => onChange('client_birthplace', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>ЕГН</Label>
            <Input
              placeholder="0000000000"
              value={data.client_egn || ''}
              onChange={(e) => onChange('client_egn', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Номер на лична карта</Label>
            <Input
              placeholder="000000000"
              value={data.client_id_number || ''}
              onChange={(e) => onChange('client_id_number', e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Лична карта валидна до</Label>
            <Input
              type="date"
              value={data.client_id_valid_until || ''}
              onChange={(e) => onChange('client_id_valid_until', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Постоянен адрес</Label>
            <Input
              placeholder="гр. София, ул. Примерна 1"
              value={data.client_address || ''}
              onChange={(e) => onChange('client_address', e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Телефонен номер</Label>
            <Input
              placeholder="+359 888 000 000"
              value={data.client_phone || ''}
              onChange={(e) => onChange('client_phone', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={data.client_email || ''}
              onChange={(e) => onChange('client_email', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Семейно положение</Label>
            <Select 
              value={data.client_marital_status || ''} 
              onValueChange={(value) => onChange('client_marital_status', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Неженен/Неомъжена</SelectItem>
                <SelectItem value="married">Женен/Омъжена</SelectItem>
                <SelectItem value="divorced">Разведен/а</SelectItem>
                <SelectItem value="widowed">Вдовец/Вдовица</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Националност</Label>
            <Select 
              value={data.client_nationality || ''} 
              onValueChange={(value) => onChange('client_nationality', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulgarian">Българска</SelectItem>
                <SelectItem value="other_eu">Друга от ЕС</SelectItem>
                <SelectItem value="non_eu">Извън ЕС</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ZMIP Declaration */}
        <div className="border-t border-slate-200 pt-4 mb-4">
          <h4 className="font-medium text-slate-700 mb-3">Декларация по член 36 от ЗМИП</h4>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <Label className="cursor-pointer text-sm">Вие или член на Вашето семейство лице ли сте по член 36 от ЗМИП?</Label>
            <Switch
              checked={data.client_is_pep || false}
              onCheckedChange={(checked) => onChange('client_is_pep', checked)}
            />
          </div>
        </div>

        {/* Employment Data */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-medium text-slate-700 mb-3">Данни за заетост, доходи и работодател</h4>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 mb-4">
            <Label className="cursor-pointer">Трудова заетост</Label>
            <Switch
              checked={data.client_is_employed || false}
              onCheckedChange={(checked) => onChange('client_is_employed', checked)}
            />
          </div>

          {data.client_is_employed ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label>Описание на месторабота и трудови задължения</Label>
                <Input
                  placeholder="Описание на длъжността..."
                  value={data.client_job_description || ''}
                  onChange={(e) => onChange('client_job_description', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Име на работодател</Label>
                <Input
                  placeholder="Фирма ЕООД"
                  value={data.client_employer_name || ''}
                  onChange={(e) => onChange('client_employer_name', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Град</Label>
                <Input
                  placeholder="София"
                  value={data.client_employer_city || ''}
                  onChange={(e) => onChange('client_employer_city', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Улица</Label>
                <Input
                  placeholder="ул. Примерна 1"
                  value={data.client_employer_street || ''}
                  onChange={(e) => onChange('client_employer_street', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Пощенски код</Label>
                <Input
                  placeholder="1000"
                  value={data.client_employer_postal_code || ''}
                  onChange={(e) => onChange('client_employer_postal_code', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Вид договор</Label>
                <Select 
                  value={data.client_contract_type || ''} 
                  onValueChange={(value) => onChange('client_contract_type', value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Изберете" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="labor">Трудов договор</SelectItem>
                    <SelectItem value="civil">Граждански договор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Срок на договора</Label>
                <Select 
                  value={data.client_contract_term || ''} 
                  onValueChange={(value) => onChange('client_contract_term', value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Изберете" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Срочен договор</SelectItem>
                    <SelectItem value="permanent">Постоянен договор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Източник на доход</Label>
                <Input
                  placeholder="Например: Наеми, Дивиденти..."
                  value={data.client_income_source || ''}
                  onChange={(e) => onChange('client_income_source', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Дейност</Label>
                <Input
                  placeholder="Описание на дейността..."
                  value={data.client_activity || ''}
                  onChange={(e) => onChange('client_activity', e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <Label className="cursor-pointer">Пушач</Label>
          <Switch
            checked={data.client_is_smoker || false}
            onCheckedChange={(checked) => onChange('client_is_smoker', checked)}
          />
        </div>
      </div>

      {/* Partner Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Партньор</h3>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm cursor-pointer">Включи партньор</Label>
            <Switch
              checked={data.include_partner || false}
              onCheckedChange={(checked) => onChange('include_partner', checked)}
            />
          </div>
        </div>
        
        {data.include_partner && (
          <>
            {/* Personal Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Име</Label>
                <Input
                  placeholder="Мария"
                  value={data.partner_first_name || ''}
                  onChange={(e) => onChange('partner_first_name', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Презиме</Label>
                <Input
                  placeholder="Иванова"
                  value={data.partner_middle_name || ''}
                  onChange={(e) => onChange('partner_middle_name', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Фамилия</Label>
                <Input
                  placeholder="Георгиева"
                  value={data.partner_last_name || ''}
                  onChange={(e) => onChange('partner_last_name', e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Дата на раждане</Label>
                <Input
                  type="date"
                  value={data.partner_birthdate || ''}
                  onChange={(e) => onChange('partner_birthdate', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Възраст (автоматично)</Label>
                <Input
                  type="number"
                  value={data.partner_age || ''}
                  readOnly
                  className="rounded-lg bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Пол</Label>
                <Select 
                  value={data.partner_gender || ''} 
                  onValueChange={(value) => onChange('partner_gender', value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Изберете" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мъж</SelectItem>
                    <SelectItem value="female">Жена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Място на раждане</Label>
                <Input
                  placeholder="гр. София"
                  value={data.partner_birthplace || ''}
                  onChange={(e) => onChange('partner_birthplace', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>ЕГН</Label>
                <Input
                  placeholder="0000000000"
                  value={data.partner_egn || ''}
                  onChange={(e) => onChange('partner_egn', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Номер на лична карта</Label>
                <Input
                  placeholder="000000000"
                  value={data.partner_id_number || ''}
                  onChange={(e) => onChange('partner_id_number', e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Лична карта валидна до</Label>
                <Input
                  type="date"
                  value={data.partner_id_valid_until || ''}
                  onChange={(e) => onChange('partner_id_valid_until', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Постоянен адрес</Label>
                <Input
                  placeholder="гр. София, ул. Примерна 1"
                  value={data.partner_address || ''}
                  onChange={(e) => onChange('partner_address', e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Телефонен номер</Label>
                <Input
                  placeholder="+359 888 000 000"
                  value={data.partner_phone || ''}
                  onChange={(e) => onChange('partner_phone', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={data.partner_email || ''}
                  onChange={(e) => onChange('partner_email', e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Семейно положение</Label>
                <Select 
                  value={data.partner_marital_status || ''} 
                  onValueChange={(value) => onChange('partner_marital_status', value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Изберете" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Неженен/Неомъжена</SelectItem>
                    <SelectItem value="married">Женен/Омъжена</SelectItem>
                    <SelectItem value="divorced">Разведен/а</SelectItem>
                    <SelectItem value="widowed">Вдовец/Вдовица</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ZMIP Declaration */}
            <div className="border-t border-slate-200 pt-4 mb-4">
              <h4 className="font-medium text-slate-700 mb-3">Декларация по член 36 от ЗМИП</h4>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <Label className="cursor-pointer text-sm">Вие или член на Вашето семейство лице ли сте по член 36 от ЗМИП?</Label>
                <Switch
                  checked={data.partner_is_pep || false}
                  onCheckedChange={(checked) => onChange('partner_is_pep', checked)}
                />
              </div>
            </div>

            {/* Employment Data */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-medium text-slate-700 mb-3">Данни за заетост, доходи и работодател</h4>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 mb-4">
                <Label className="cursor-pointer">Трудова заетост</Label>
                <Switch
                  checked={data.partner_is_employed || false}
                  onCheckedChange={(checked) => onChange('partner_is_employed', checked)}
                />
              </div>

              {data.partner_is_employed ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label>Описание на месторабота и трудови задължения</Label>
                    <Input
                      placeholder="Описание на длъжността..."
                      value={data.partner_job_description || ''}
                      onChange={(e) => onChange('partner_job_description', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Име на работодател</Label>
                    <Input
                      placeholder="Фирма ЕООД"
                      value={data.partner_employer_name || ''}
                      onChange={(e) => onChange('partner_employer_name', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Град</Label>
                    <Input
                      placeholder="София"
                      value={data.partner_employer_city || ''}
                      onChange={(e) => onChange('partner_employer_city', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Улица</Label>
                    <Input
                      placeholder="ул. Примерна 1"
                      value={data.partner_employer_street || ''}
                      onChange={(e) => onChange('partner_employer_street', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Пощенски код</Label>
                    <Input
                      placeholder="1000"
                      value={data.partner_employer_postal_code || ''}
                      onChange={(e) => onChange('partner_employer_postal_code', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Вид договор</Label>
                    <Select 
                      value={data.partner_contract_type || ''} 
                      onValueChange={(value) => onChange('partner_contract_type', value)}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Изберете" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="labor">Трудов договор</SelectItem>
                        <SelectItem value="civil">Граждански договор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Срок на договора</Label>
                    <Select 
                      value={data.partner_contract_term || ''} 
                      onValueChange={(value) => onChange('partner_contract_term', value)}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Изберете" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Срочен договор</SelectItem>
                        <SelectItem value="permanent">Постоянен договор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Източник на доход</Label>
                    <Input
                      placeholder="Например: Наеми, Дивиденти..."
                      value={data.partner_income_source || ''}
                      onChange={(e) => onChange('partner_income_source', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Дейност</Label>
                    <Input
                      placeholder="Описание на дейността..."
                      value={data.partner_activity || ''}
                      onChange={(e) => onChange('partner_activity', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <Label className="cursor-pointer">Пушач</Label>
              <Switch
                checked={data.partner_is_smoker || false}
                onCheckedChange={(checked) => onChange('partner_is_smoker', checked)}
              />
            </div>
          </>
        )}

        {!data.include_partner && (
          <p className="text-slate-500 text-sm text-center py-4">
            Активирайте превключвателя по-горе, за да добавите данни за партньор.
          </p>
        )}
      </div>

      {/* Children Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Baby className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Деца</h3>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Брой деца</Label>
              <Select 
                value={data.children_count?.toString() || ''} 
                onValueChange={(value) => onChange('children_count', parseInt(value))}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">Икономическа зависимост</Label>
              <Switch
                checked={data.children_economically_dependent || false}
                onCheckedChange={(checked) => onChange('children_economically_dependent', checked)}
              />
            </div>
          </div>

          {(data.children_count || 0) > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <Label className="text-sm text-slate-600">Данни за децата</Label>
              {Array.from({ length: data.children_count || 0 }).map((_, index) => (
                <div key={index} className="grid sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <Label className="text-xs">Дете {index + 1} - Име</Label>
                    <Input
                      placeholder="Име на детето"
                      value={data[`child_${index + 1}_name`] || ''}
                      onChange={(e) => onChange(`child_${index + 1}_name`, e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Дата на раждане</Label>
                    <Input
                      type="date"
                      value={data[`child_${index + 1}_birthdate`] || ''}
                      onChange={(e) => onChange(`child_${index + 1}_birthdate`, e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}