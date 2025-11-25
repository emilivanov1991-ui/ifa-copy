import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Shield, Wallet, Building2, Car, Plus, Download } from 'lucide-react';

export default function ProtectionStep({ data, onChange }) {
  // Helper to import data from housing section
  const importFromHousing = () => {
    if (data.current_housing === 'owned') {
      onChange('property_1_address', data.current_housing_address || data.client_address || '');
      onChange('property_1_rooms', data.current_housing_rooms || '');
      onChange('property_1_area', data.current_housing_area || '');
      onChange('property_1_value', data.current_housing_value || '');
      onChange('property_1_movable_value', data.current_housing_movable_value || '');
    }
  };

  return (
    <div className="space-y-8">
      {/* Property Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Защита на собствеността</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">Какво имущество притежавате?</p>

        <div className="space-y-6">
          {/* Property 1 - Main */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <Label className="font-medium">Недвижимо имущество</Label>
              </div>
              <Switch
                checked={data.has_property_1 || false}
                onCheckedChange={(checked) => onChange('has_property_1', checked)}
              />
            </div>

            {data.has_property_1 && (
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                {data.current_housing === 'owned' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={importFromHousing}
                    className="rounded-full mb-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Вземи данни от "Ново жилище"
                  </Button>
                )}
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Адрес</Label>
                    <Input
                      placeholder="гр. София, ул. ..."
                      value={data.property_1_address || ''}
                      onChange={(e) => onChange('property_1_address', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Брой стаи</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={data.property_1_rooms || ''}
                      onChange={(e) => onChange('property_1_rooms', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Застроена площ (кв.м)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="80"
                      value={data.property_1_area || ''}
                      onChange={(e) => onChange('property_1_area', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={data.property_1_value || ''}
                      onChange={(e) => onChange('property_1_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Стойност на движимото имущество (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10000"
                      value={data.property_1_movable_value || ''}
                      onChange={(e) => onChange('property_1_movable_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Property 1 Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
                    <Switch
                      checked={data.property_1_has_insurance || false}
                      onCheckedChange={(checked) => onChange('property_1_has_insurance', checked)}
                    />
                  </div>
                  {data.property_1_has_insurance && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.property_1_insurer || ''}
                          onChange={(e) => onChange('property_1_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.property_1_insurance_expiry || ''}
                          onChange={(e) => onChange('property_1_insurance_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Property 2 Button */}
            {data.has_property_1 && !data.has_property_2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onChange('has_property_2', true)}
                className="rounded-full ml-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добави втори имот
              </Button>
            )}
          </div>

          {/* Property 2 */}
          {data.has_property_2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Втори имот</Label>
                </div>
                <Switch
                  checked={data.has_property_2 || false}
                  onCheckedChange={(checked) => onChange('has_property_2', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Адрес</Label>
                    <Input
                      placeholder="гр. София, ул. ..."
                      value={data.property_2_address || ''}
                      onChange={(e) => onChange('property_2_address', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Брой стаи</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={data.property_2_rooms || ''}
                      onChange={(e) => onChange('property_2_rooms', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Застроена площ (кв.м)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="80"
                      value={data.property_2_area || ''}
                      onChange={(e) => onChange('property_2_area', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={data.property_2_value || ''}
                      onChange={(e) => onChange('property_2_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Стойност на движимото имущество (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10000"
                      value={data.property_2_movable_value || ''}
                      onChange={(e) => onChange('property_2_movable_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Property 2 Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
                    <Switch
                      checked={data.property_2_has_insurance || false}
                      onCheckedChange={(checked) => onChange('property_2_has_insurance', checked)}
                    />
                  </div>
                  {data.property_2_has_insurance && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.property_2_insurer || ''}
                          onChange={(e) => onChange('property_2_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.property_2_insurance_expiry || ''}
                          onChange={(e) => onChange('property_2_insurance_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Property 3 Button */}
              {!data.has_property_3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChange('has_property_3', true)}
                  className="rounded-full ml-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добави трети имот
                </Button>
              )}
            </div>
          )}

          {/* Property 3 */}
          {data.has_property_3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Трети имот</Label>
                </div>
                <Switch
                  checked={data.has_property_3 || false}
                  onCheckedChange={(checked) => onChange('has_property_3', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Адрес</Label>
                    <Input
                      placeholder="гр. София, ул. ..."
                      value={data.property_3_address || ''}
                      onChange={(e) => onChange('property_3_address', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Брой стаи</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={data.property_3_rooms || ''}
                      onChange={(e) => onChange('property_3_rooms', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Застроена площ (кв.м)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="80"
                      value={data.property_3_area || ''}
                      onChange={(e) => onChange('property_3_area', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={data.property_3_value || ''}
                      onChange={(e) => onChange('property_3_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Стойност на движимото имущество (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10000"
                      value={data.property_3_movable_value || ''}
                      onChange={(e) => onChange('property_3_movable_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Property 3 Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
                    <Switch
                      checked={data.property_3_has_insurance || false}
                      onCheckedChange={(checked) => onChange('property_3_has_insurance', checked)}
                    />
                  </div>
                  {data.property_3_has_insurance && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.property_3_insurer || ''}
                          onChange={(e) => onChange('property_3_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.property_3_insurance_expiry || ''}
                          onChange={(e) => onChange('property_3_insurance_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Car 1 */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-500" />
                <Label className="font-medium">Автомобил</Label>
              </div>
              <Switch
                checked={data.has_car_1 || false}
                onCheckedChange={(checked) => onChange('has_car_1', checked)}
              />
            </div>

            {data.has_car_1 && (
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Марка</Label>
                    <Input
                      placeholder="Toyota"
                      value={data.car_1_brand || ''}
                      onChange={(e) => onChange('car_1_brand', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Модел</Label>
                    <Input
                      placeholder="Corolla"
                      value={data.car_1_model || ''}
                      onChange={(e) => onChange('car_1_model', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Година на производство</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2025"
                      placeholder="2020"
                      value={data.car_1_year || ''}
                      onChange={(e) => onChange('car_1_year', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="15000"
                      value={data.car_1_value || ''}
                      onChange={(e) => onChange('car_1_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 1 GO Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">ГО-Застраховател</Label>
                    <Input
                      placeholder="Име на застраховател"
                      value={data.car_1_go_insurer || ''}
                      onChange={(e) => onChange('car_1_go_insurer', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 1 Casco */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли Каско?</Label>
                    <Switch
                      checked={data.car_1_has_casco || false}
                      onCheckedChange={(checked) => onChange('car_1_has_casco', checked)}
                    />
                  </div>
                  {data.car_1_has_casco && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.car_1_casco_insurer || ''}
                          onChange={(e) => onChange('car_1_casco_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.car_1_casco_expiry || ''}
                          onChange={(e) => onChange('car_1_casco_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Car 2 Button */}
            {data.has_car_1 && !data.has_car_2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onChange('has_car_2', true)}
                className="rounded-full ml-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добави втори автомобил
              </Button>
            )}
          </div>

          {/* Car 2 */}
          {data.has_car_2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Втори автомобил</Label>
                </div>
                <Switch
                  checked={data.has_car_2 || false}
                  onCheckedChange={(checked) => onChange('has_car_2', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Марка</Label>
                    <Input
                      placeholder="Toyota"
                      value={data.car_2_brand || ''}
                      onChange={(e) => onChange('car_2_brand', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Модел</Label>
                    <Input
                      placeholder="Corolla"
                      value={data.car_2_model || ''}
                      onChange={(e) => onChange('car_2_model', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Година на производство</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2025"
                      placeholder="2020"
                      value={data.car_2_year || ''}
                      onChange={(e) => onChange('car_2_year', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="15000"
                      value={data.car_2_value || ''}
                      onChange={(e) => onChange('car_2_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 2 GO Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">ГО-Застраховател</Label>
                    <Input
                      placeholder="Име на застраховател"
                      value={data.car_2_go_insurer || ''}
                      onChange={(e) => onChange('car_2_go_insurer', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 2 Casco */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли Каско?</Label>
                    <Switch
                      checked={data.car_2_has_casco || false}
                      onCheckedChange={(checked) => onChange('car_2_has_casco', checked)}
                    />
                  </div>
                  {data.car_2_has_casco && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.car_2_casco_insurer || ''}
                          onChange={(e) => onChange('car_2_casco_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.car_2_casco_expiry || ''}
                          onChange={(e) => onChange('car_2_casco_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Car 3 Button */}
              {!data.has_car_3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChange('has_car_3', true)}
                  className="rounded-full ml-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добави трети автомобил
                </Button>
              )}
            </div>
          )}

          {/* Car 3 */}
          {data.has_car_3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Трети автомобил</Label>
                </div>
                <Switch
                  checked={data.has_car_3 || false}
                  onCheckedChange={(checked) => onChange('has_car_3', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Марка</Label>
                    <Input
                      placeholder="Toyota"
                      value={data.car_3_brand || ''}
                      onChange={(e) => onChange('car_3_brand', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Модел</Label>
                    <Input
                      placeholder="Corolla"
                      value={data.car_3_model || ''}
                      onChange={(e) => onChange('car_3_model', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Година на производство</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2025"
                      placeholder="2020"
                      value={data.car_3_year || ''}
                      onChange={(e) => onChange('car_3_year', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="15000"
                      value={data.car_3_value || ''}
                      onChange={(e) => onChange('car_3_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 3 GO Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">ГО-Застраховател</Label>
                    <Input
                      placeholder="Име на застраховател"
                      value={data.car_3_go_insurer || ''}
                      onChange={(e) => onChange('car_3_go_insurer', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 3 Casco */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли Каско?</Label>
                    <Switch
                      checked={data.car_3_has_casco || false}
                      onCheckedChange={(checked) => onChange('car_3_has_casco', checked)}
                    />
                  </div>
                  {data.car_3_has_casco && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.car_3_casco_insurer || ''}
                          onChange={(e) => onChange('car_3_casco_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.car_3_casco_expiry || ''}
                          onChange={(e) => onChange('car_3_casco_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Include property in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_property_in_plan || false}
          onCheckedChange={(checked) => onChange('include_property_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>

      {/* Income Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Подсигуряване на доходите</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>От къде идват Вашите доходи?</Label>
            <Select 
              value={data.income_source || ''} 
              onValueChange={(value) => onChange('income_source', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">Работа по трудов договор</SelectItem>
                <SelectItem value="self_employed">Собствен бизнес</SelectItem>
                <SelectItem value="rent">Наем</SelectItem>
                <SelectItem value="investments">Инвестиции</SelectItem>
                <SelectItem value="mixed">Смесени източници</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">Какво би се отразило негативно върху Вашите доходи?</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Съкращение</Label>
                <Switch
                  checked={data.risk_layoff || false}
                  onCheckedChange={(checked) => onChange('risk_layoff', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Отпуск по майчинство</Label>
                <Switch
                  checked={data.risk_maternity || false}
                  onCheckedChange={(checked) => onChange('risk_maternity', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Болнични</Label>
                <Switch
                  checked={data.risk_sick_leave || false}
                  onCheckedChange={(checked) => onChange('risk_sick_leave', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Инвалидност</Label>
                <Switch
                  checked={data.risk_disability || false}
                  onCheckedChange={(checked) => onChange('risk_disability', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Смърт</Label>
                <Switch
                  checked={data.risk_death || false}
                  onCheckedChange={(checked) => onChange('risk_death', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Label className="cursor-pointer">Имате ли подсигуряване на доходите?</Label>
            <Switch
              checked={data.has_income_protection || false}
              onCheckedChange={(checked) => onChange('has_income_protection', checked)}
            />
          </div>
        </div>
      </div>

      {/* Include income protection in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_income_protection_in_plan || false}
          onCheckedChange={(checked) => onChange('include_income_protection_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}