import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award,
  BookOpen,
  Video,
  Target,
  TrendingUp,
  Star,
  ChevronRight,
  Lightbulb,
  Route
} from 'lucide-react';

const courses = [
  { id: 1, title: 'Основи на финансовото планиране', category: 'Основи', duration: 240, timeSpent: 240, lessons: 12, completed: 12, status: 'completed', certificate: true, rating: 4.8 },
  { id: 2, title: 'Инвестиционни стратегии', category: 'Инвестиции', duration: 360, timeSpent: 280, lessons: 18, completed: 14, status: 'in_progress', certificate: false, rating: 4.9 },
  { id: 3, title: 'Застрахователни продукти', category: 'Застраховки', duration: 300, timeSpent: 0, lessons: 15, completed: 0, status: 'not_started', certificate: false, rating: 4.7 },
  { id: 4, title: 'Пенсионно осигуряване', category: 'Пенсии', duration: 180, timeSpent: 0, lessons: 10, completed: 0, status: 'not_started', certificate: false, rating: 4.6 },
  { id: 5, title: 'Комуникация с клиенти', category: 'Умения', duration: 240, timeSpent: 160, lessons: 12, completed: 8, status: 'in_progress', certificate: false, rating: 4.8 },
  { id: 6, title: 'Данъчно планиране', category: 'Финанси', duration: 200, timeSpent: 0, lessons: 10, completed: 0, status: 'not_started', certificate: false, rating: 4.5 },
];

const learningPaths = [
  { 
    id: 1, 
    title: 'Сертифициран финансов консултант', 
    description: 'Пълна програма за начинаещи консултанти',
    courses: [1, 2, 3, 4],
    totalDuration: 1080,
    progress: 65,
    level: 'Начинаещ'
  },
  { 
    id: 2, 
    title: 'Експерт по инвестиции', 
    description: 'Задълбочено обучение по инвестиционни продукти',
    courses: [2, 6],
    totalDuration: 560,
    progress: 50,
    level: 'Напреднал'
  },
  { 
    id: 3, 
    title: 'Мастър в продажбите', 
    description: 'Усъвършенствайте комуникационните си умения',
    courses: [5],
    totalDuration: 240,
    progress: 67,
    level: 'Среден'
  },
];

const recommendations = [
  { courseId: 3, reason: 'Базирано на вашия прогрес в инвестиции', priority: 'high' },
  { courseId: 4, reason: 'Популярен сред консултанти с вашия профил', priority: 'medium' },
  { courseId: 6, reason: 'Допълва вашите текущи умения', priority: 'medium' },
];

const timeTracking = [
  { date: '2024-01-20', courseId: 2, minutes: 45 },
  { date: '2024-01-21', courseId: 5, minutes: 30 },
  { date: '2024-01-22', courseId: 2, minutes: 60 },
  { date: '2024-01-23', courseId: 5, minutes: 25 },
  { date: '2024-01-24', courseId: 2, minutes: 40 },
];

export default function ConsultantElearningAdvanced() {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedPath, setSelectedPath] = useState(null);

  const totalTimeSpent = courses.reduce((sum, c) => sum + c.timeSpent, 0);
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const certificates = courses.filter(c => c.certificate).length;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const getRecommendedCourses = () => {
    return recommendations.map(rec => ({
      ...courses.find(c => c.id === rec.courseId),
      reason: rec.reason,
      priority: rec.priority
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Общо време</p>
                <p className="text-lg font-bold">{formatTime(totalTimeSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Завършени</p>
                <p className="text-lg font-bold">{completedCourses}/{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Сертификати</p>
                <p className="text-lg font-bold">{certificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Тази седмица</p>
                <p className="text-lg font-bold">{formatTime(timeTracking.reduce((s, t) => s + t.minutes, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Курсове</TabsTrigger>
          <TabsTrigger value="paths">Обучителни пътеки</TabsTrigger>
          <TabsTrigger value="recommendations">Препоръки</TabsTrigger>
          <TabsTrigger value="tracking">Проследяване</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const progress = course.lessons > 0 ? (course.completed / course.lessons) * 100 : 0;
              return (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{course.category}</Badge>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(course.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {course.lessons} урока
                      </span>
                    </div>
                    {course.timeSpent > 0 && (
                      <p className="text-xs text-blue-600 mb-2">
                        Прекарано време: {formatTime(course.timeSpent)}
                      </p>
                    )}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>Прогрес</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      {course.status === 'completed' ? 'Преглед' : course.status === 'in_progress' ? 'Продължи' : 'Започни'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="paths" className="mt-6">
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <Card key={path.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPath(path)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Route className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{path.title}</h3>
                          <Badge variant="outline">{path.level}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{path.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{path.courses.length} курса</span>
                          <span>{formatTime(path.totalDuration)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{path.progress}%</p>
                      <p className="text-xs text-slate-500">завършено</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={path.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Персонализирани препоръки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 mb-4">Базирано на вашия прогрес и роля като консултант</p>
              <div className="space-y-4">
                {getRecommendedCourses().map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200">
                    <div className={`w-2 h-12 rounded-full ${course.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{course.title}</h4>
                      <p className="text-sm text-slate-500">{course.reason}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(course.duration)}
                      </div>
                    </div>
                    <Button size="sm">Започни</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Проследяване на времето</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeTracking.map((entry, index) => {
                  const course = courses.find(c => c.id === entry.courseId);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Video className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{course?.title}</p>
                          <p className="text-xs text-slate-500">{entry.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{formatTime(entry.minutes)}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}