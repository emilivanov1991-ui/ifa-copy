import React from 'react';
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
import { User, Users } from 'lucide-react';

export default function PersonalDataStep({ data, onChange }) {
  return (
    <div className="space-y-8">
      {/* Client Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Клиент</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Възраст</Label>
            <Input
              type="number"
              min="18"
              max="100"
              placeholder="35"
              value={data.client_age || ''}
              onChange={(e) => onChange('client_age', parseInt(e.target.value) || '')}
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
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Партньор</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Възраст</Label>
            <Input
              type="number"
              min="18"
              max="100"
              placeholder="35"
              value={data.partner_age || ''}
              onChange={(e) => onChange('partner_age', parseInt(e.target.value) || '')}
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <Label className="cursor-pointer">Пушач</Label>
          <Switch
            checked={data.partner_is_smoker || false}
            onCheckedChange={(checked) => onChange('partner_is_smoker', checked)}
          />
        </div>
      </div>

      {/* Children Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Деца</h3>
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