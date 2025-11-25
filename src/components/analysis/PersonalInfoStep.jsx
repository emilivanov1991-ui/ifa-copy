import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function PersonalInfoStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            placeholder="John"
            value={data.first_name || ''}
            onChange={(e) => onChange('first_name', e.target.value)}
            required
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            value={data.last_name || ''}
            onChange={(e) => onChange('last_name', e.target.value)}
            required
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            required
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(123) 456-7890"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="35"
            min="18"
            max="120"
            value={data.age || ''}
            onChange={(e) => onChange('age', parseInt(e.target.value) || '')}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marital_status">Marital Status</Label>
          <Select 
            value={data.marital_status || ''} 
            onValueChange={(value) => onChange('marital_status', value)}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dependents">Dependents</Label>
          <Input
            id="dependents"
            type="number"
            placeholder="0"
            min="0"
            value={data.dependents || ''}
            onChange={(e) => onChange('dependents', parseInt(e.target.value) || '')}
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employment_status">Employment Status</Label>
          <Select 
            value={data.employment_status || ''} 
            onValueChange={(value) => onChange('employment_status', value)}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">Employed</SelectItem>
              <SelectItem value="self_employed">Self-Employed</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            placeholder="Software Engineer"
            value={data.occupation || ''}
            onChange={(e) => onChange('occupation', e.target.value)}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}