import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award,
  BookOpen,
  Video,
  FileText,
  Lock,
  ChevronRight
} from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Основи на финансовото планиране',
    description: 'Научете основните принципи на личното финансово планиране',
    duration: '4 часа',
    lessons: 12,
    completed: 12,
    status: 'completed',
    category: 'Основи',
    certificate: true
  },
  {
    id: 2,
    title: 'Инвестиционни стратегии',
    description: 'Разберете различните типове инвестиции и как да ги препоръчвате',
    duration: '6 часа',
    lessons: 18,
    completed: 14,
    status: 'in_progress',
    category: 'Инвестиции',
    certificate: false
  },
  {
    id: 3,
    title: 'Застрахователни продукти',
    description: 'Детайлен преглед на животозастраховките и имуществените застраховки',
    duration: '5 часа',
    lessons: 15,
    completed: 0,
    status: 'not_started',
    category: 'Застраховки',
    certificate: false
  },
  {
    id: 4,
    title: 'Пенсионно осигуряване',
    description: 'Всичко за трите стълба на пенсионната система',
    duration: '3 часа',
    lessons: 10,
    completed: 0,
    status: 'locked',
    category: 'Пенсии',
    certificate: false
  },
  {
    id: 5,
    title: 'Комуникация с клиенти',
    description: 'Ефективни техники за продажби и обслужване на клиенти',
    duration: '4 часа',
    lessons: 12,
    completed: 8,
    status: 'in_progress',
    category: 'Умения',
    certificate: false
  },
];

const statusConfig = {
  completed: { label: 'Завършен', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  in_progress: { label: 'В процес', color: 'bg-blue-100 text-blue-700', icon: Play },
  not_started: { label: 'Не е започнат', color: 'bg-slate-100 text-slate-700', icon: BookOpen },
  locked: { label: 'Заключен', color: 'bg-slate-100 text-slate-500', icon: Lock },
};

export default function ConsultantElearning() {
  const [filter, setFilter] = useState('all');

  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);
  const completedLessons = courses.reduce((sum, c) => sum + c.completed, 0);

  const filteredCourses = courses.filter(c => 
    filter === 'all' || c.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">E-Learning център</h2>
          <p className="text-slate-500">Развивайте уменията си с нашите обучения</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Award className="h-5 w-5 text-amber-600" />
          <span className="font-medium text-amber-800">{completedCourses} сертификата</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Курсове</p>
                <p className="text-xl font-bold">{completedCourses} / {courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Уроци</p>
                <p className="text-xl font-bold">{completedLessons} / {totalLessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Общо време</p>
                <p className="text-xl font-bold">22 часа</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Всички' },
          { value: 'in_progress', label: 'В процес' },
          { value: 'not_started', label: 'Нови' },
          { value: 'completed', label: 'Завършени' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? 'bg-blue-600' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredCourses.map((course) => {
          const StatusIcon = statusConfig[course.status].icon;
          const progress = course.lessons > 0 ? (course.completed / course.lessons) * 100 : 0;

          return (
            <Card key={course.id} className={course.status === 'locked' ? 'opacity-60' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline">{course.category}</Badge>
                  <Badge className={statusConfig[course.status].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[course.status].label}
                  </Badge>
                </div>

                <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{course.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {course.lessons} урока
                  </div>
                  {course.certificate && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Award className="h-4 w-4" />
                      Сертификат
                    </div>
                  )}
                </div>

                {course.status !== 'locked' && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Прогрес</span>
                      <span className="font-medium">{course.completed}/{course.lessons}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button 
                  className={`w-full ${course.status === 'locked' ? '' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={course.status === 'locked'}
                >
                  {course.status === 'completed' ? 'Преглед' : 
                   course.status === 'in_progress' ? 'Продължи' :
                   course.status === 'locked' ? 'Заключен' : 'Започни'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}