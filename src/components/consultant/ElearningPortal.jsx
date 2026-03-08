import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, Play, CheckCircle2, Clock, Award, BookOpen,
  Video, Lock, ChevronRight, Plus, Pencil, Trash2, FileText,
  BarChart3, Users, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

// ─── Lesson Viewer (inline) ──────────────────────────────────────────────────
function LessonViewer({ lesson, onComplete, isCompleted }) {
  const getYouTubeId = (url) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-slate-900">{lesson.title}</h3>

      {lesson.content_type === 'video' && lesson.content_url && (
        <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
          {getYouTubeId(lesson.content_url) ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(lesson.content_url)}`}
              allowFullScreen
            />
          ) : (
            <video src={lesson.content_url} controls className="w-full h-full" />
          )}
        </div>
      )}

      {lesson.content_type === 'pdf' && lesson.content_url && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <iframe src={lesson.content_url} className="w-full h-[500px]" title={lesson.title} />
        </div>
      )}

      {lesson.content_type === 'text' && lesson.content_text && (
        <div className="prose max-w-none p-6 bg-slate-50 rounded-xl text-slate-700 leading-relaxed whitespace-pre-wrap">
          {lesson.content_text}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          {lesson.duration_minutes} мин.
        </div>
        {isCompleted ? (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Завършен
          </Badge>
        ) : (
          <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Маркирай като завършен
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Exam (inline) ────────────────────────────────────────────────────────────
function ExamView({ course, questions, progress, onExamComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    await onExamComplete(pct);
  };

  if (submitted) {
    const passed = score >= (course.passing_score || 80);
    return (
      <div className={`rounded-2xl p-8 text-center ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <Award className="h-10 w-10 text-green-600" /> : <AlertCircle className="h-10 w-10 text-red-500" />}
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {passed ? '🎉 Поздравления!' : 'Не е преминат'}
        </h3>
        <p className="text-4xl font-bold mb-2">{score}%</p>
        <p className={`text-sm mb-6 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? `Успешно преминат! Мин. изискване: ${course.passing_score || 80}%` : `Нужно: ${course.passing_score || 80}% | Постигнато: ${score}%`}
        </p>
        {!passed && (
          <Button onClick={() => { setSubmitted(false); setAnswers({}); }} variant="outline">
            Опитай отново
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Изпит: {course.title}</h3>
        <Badge variant="outline">{questions.length} въпроса</Badge>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="p-4 rounded-xl border border-slate-200 space-y-3">
          <p className="font-medium text-slate-900">{idx + 1}. {q.question}</p>
          <div className="space-y-2">
            {['a', 'b', 'c', 'd'].map(opt => {
              const text = q[`option_${opt}`];
              if (!text) return null;
              return (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers(p => ({ ...p, [q.id]: opt }))} className="accent-blue-600" />
                  <span className="text-sm">{text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Предай изпита ({Object.keys(answers).length}/{questions.length} отговора)
      </Button>
    </div>
  );
}

// ─── Admin Course Form ────────────────────────────────────────────────────────
function CourseForm({ course, onSave, onCancel }) {
  const [data, setData] = useState(course || { title: '', description: '', level: 1, category: '', passing_score: 80, is_active: true, order: 100 });
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Заглавие *</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={data.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Категория</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={data.category} onChange={e => set('category', e.target.value)} placeholder="Основи, Инвестиции..." />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Ниво</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={data.level} onChange={e => set('level', parseInt(e.target.value))}>
            <option value={1}>Level 1 — Junior</option>
            <option value={2}>Level 2 — Senior</option>
            <option value={3}>Level 3 — Expert</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Мин. резултат за изпит (%)</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={data.passing_score} onChange={e => set('passing_score', parseInt(e.target.value))} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">Описание</label>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={data.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Отказ</Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onSave(data)}>Запази</Button>
      </div>
    </div>
  );
}

// ─── Admin Lesson Form ────────────────────────────────────────────────────────
function LessonForm({ lesson, courseId, onSave, onCancel }) {
  const [data, setData] = useState(lesson || { course_id: courseId, title: '', content_type: 'video', content_url: '', content_text: '', duration_minutes: 10, order: 100, is_active: true });
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3 p-3 bg-white rounded-lg border mt-2">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Заглавие *</label>
          <input className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Тип</label>
          <select className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.content_type} onChange={e => set('content_type', e.target.value)}>
            <option value="video">Видео (YouTube/MP4)</option>
            <option value="pdf">PDF документ</option>
            <option value="text">Текст</option>
          </select>
        </div>
        {(data.content_type === 'video' || data.content_type === 'pdf') && (
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">URL</label>
            <input className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.content_url} onChange={e => set('content_url', e.target.value)} placeholder="https://..." />
          </div>
        )}
        {data.content_type === 'text' && (
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Съдържание</label>
            <textarea className="w-full border rounded-lg px-3 py-1.5 text-sm" rows={4} value={data.content_text} onChange={e => set('content_text', e.target.value)} />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Продължителност (мин)</label>
          <input type="number" className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.duration_minutes} onChange={e => set('duration_minutes', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Ред</label>
          <input type="number" className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.order} onChange={e => set('order', parseInt(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Отказ</Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onSave(data)}>Запази</Button>
      </div>
    </div>
  );
}

// ─── Admin Question Form ──────────────────────────────────────────────────────
function QuestionForm({ question, courseId, onSave, onCancel }) {
  const [data, setData] = useState(question || { course_id: courseId, question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', explanation: '', order: 100, is_active: true });
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3 p-3 bg-white rounded-lg border mt-2">
      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">Въпрос *</label>
        <textarea className="w-full border rounded-lg px-3 py-1.5 text-sm" rows={2} value={data.question} onChange={e => set('question', e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {['a', 'b', 'c', 'd'].map(opt => (
          <div key={opt}>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Вариант {opt.toUpperCase()}</label>
            <input className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data[`option_${opt}`]} onChange={e => set(`option_${opt}`, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Верен отговор</label>
          <select className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.correct_answer} onChange={e => set('correct_answer', e.target.value)}>
            {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Обяснение (по избор)</label>
          <input className="w-full border rounded-lg px-3 py-1.5 text-sm" value={data.explanation} onChange={e => set('explanation', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Отказ</Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onSave(data)}>Запази</Button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ElearningPortal({ isAdmin = false }) {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [view, setView] = useState('catalog'); // catalog | course | lesson | exam | admin
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Admin UI state
  const [adminTab, setAdminTab] = useState('courses');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [user, cs, ls, qs, ps] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.Course.list('order'),
      base44.entities.Lesson.list('order'),
      base44.entities.ExamQuestion.list('order'),
      base44.entities.ConsultantProgress.list('-updated_date', 200),
    ]);
    setCurrentUser(user);
    setCourses(cs.filter(c => c.is_active));
    setLessons(ls.filter(l => l.is_active));
    setQuestions(qs.filter(q => q.is_active));
    setProgress(ps);
    setLoading(false);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getMyProgress = (courseId) => progress.find(p => p.user_email === currentUser?.email && p.course_id === courseId);
  const getCourseLessons = (courseId) => lessons.filter(l => l.course_id === courseId).sort((a, b) => a.order - b.order);
  const getCourseQuestions = (courseId) => questions.filter(q => q.course_id === courseId).sort((a, b) => a.order - b.order);

  const getCourseStatus = (course) => {
    const prog = getMyProgress(course.id);
    if (!prog) return 'not_started';
    if (prog.exam_passed) return 'completed';
    if ((prog.lessons_completed || []).length > 0) return 'in_progress';
    return 'not_started';
  };

  const isCourseUnlocked = (course) => {
    if (course.level === 1) return true;
    // Must pass previous level
    const prevLevelCourses = courses.filter(c => c.level === course.level - 1);
    return prevLevelCourses.every(c => {
      const prog = getMyProgress(c.id);
      return prog?.exam_passed;
    });
  };

  const completedLessonIds = (courseId) => getMyProgress(courseId)?.lessons_completed || [];

  const getLessonProgress = (courseId) => {
    const cls = getCourseLessons(courseId);
    const done = completedLessonIds(courseId);
    return cls.length > 0 ? Math.round((done.length / cls.length) * 100) : 0;
  };

  // ── Actions ───────────────────────────────────────────────────────────────────
  const markLessonComplete = async (lessonId) => {
    if (!selectedCourse || !currentUser) return;
    const prog = getMyProgress(selectedCourse.id);
    const done = prog?.lessons_completed || [];
    if (done.includes(lessonId)) return;
    const newDone = [...done, lessonId];
    if (prog) {
      await base44.entities.ConsultantProgress.update(prog.id, { lessons_completed: newDone });
    } else {
      await base44.entities.ConsultantProgress.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        course_id: selectedCourse.id,
        lessons_completed: newDone,
        exam_attempts: 0,
        exam_passed: false,
      });
    }
    await loadAll();
  };

  const handleExamComplete = async (score) => {
    if (!selectedCourse || !currentUser) return;
    const passed = score >= (selectedCourse.passing_score || 80);
    const prog = getMyProgress(selectedCourse.id);
    const attempts = (prog?.exam_attempts || 0) + 1;
    const update = {
      exam_score: score,
      exam_passed: passed,
      exam_attempts: attempts,
      exam_completed_at: new Date().toISOString(),
      ...(passed ? { course_completed_at: new Date().toISOString() } : {}),
    };
    if (prog) {
      await base44.entities.ConsultantProgress.update(prog.id, update);
    } else {
      await base44.entities.ConsultantProgress.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        course_id: selectedCourse.id,
        lessons_completed: [],
        ...update,
      });
    }
    await loadAll();
  };

  // ── Admin CRUD ────────────────────────────────────────────────────────────────
  const saveCourse = async (data) => {
    if (data.id) await base44.entities.Course.update(data.id, data);
    else await base44.entities.Course.create(data);
    setShowCourseForm(false); setEditingCourse(null);
    await loadAll();
  };

  const deleteCourse = async (id) => {
    if (!confirm('Изтрий курса?')) return;
    await base44.entities.Course.delete(id);
    await loadAll();
  };

  const saveLesson = async (data) => {
    if (data.id) await base44.entities.Lesson.update(data.id, data);
    else await base44.entities.Lesson.create(data);
    setShowLessonForm(null); setEditingLesson(null);
    await loadAll();
  };

  const deleteLesson = async (id) => {
    if (!confirm('Изтрий урока?')) return;
    await base44.entities.Lesson.delete(id);
    await loadAll();
  };

  const saveQuestion = async (data) => {
    if (data.id) await base44.entities.ExamQuestion.update(data.id, data);
    else await base44.entities.ExamQuestion.create(data);
    setShowQuestionForm(null); setEditingQuestion(null);
    await loadAll();
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Изтрий въпроса?')) return;
    await base44.entities.ExamQuestion.delete(id);
    await loadAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: LESSON
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'lesson' && selectedLesson && selectedCourse) {
    const cls = getCourseLessons(selectedCourse.id);
    const currentIdx = cls.findIndex(l => l.id === selectedLesson.id);
    const isCompleted = completedLessonIds(selectedCourse.id).includes(selectedLesson.id);
    const allDone = cls.every(l => completedLessonIds(selectedCourse.id).includes(l.id));

    return (
      <div className="space-y-4">
        <button onClick={() => setView('course')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          ← Назад към {selectedCourse.title}
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <LessonViewer
                  lesson={selectedLesson}
                  isCompleted={isCompleted}
                  onComplete={() => markLessonComplete(selectedLesson.id)}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between mt-4">
              <Button variant="outline" disabled={currentIdx === 0}
                onClick={() => setSelectedLesson(cls[currentIdx - 1])}>
                ← Предишен урок
              </Button>
              {currentIdx < cls.length - 1 ? (
                <Button className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setSelectedLesson(cls[currentIdx + 1])}>
                  Следващ урок →
                </Button>
              ) : allDone ? (
                <Button className="bg-green-600 hover:bg-green-700"
                  onClick={() => setView('exam')}>
                  Към изпита 🎓
                </Button>
              ) : null}
            </div>
          </div>

          {/* Sidebar lessons list */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Уроци в курса</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1">
                {cls.map((l, i) => {
                  const done = completedLessonIds(selectedCourse.id).includes(l.id);
                  const active = l.id === selectedLesson.id;
                  return (
                    <button key={l.id}
                      onClick={() => setSelectedLesson(l)}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50'}`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
                      <span className="truncate">{i + 1}. {l.title}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: EXAM
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'exam' && selectedCourse) {
    const qs = getCourseQuestions(selectedCourse.id);
    return (
      <div className="space-y-4 max-w-2xl">
        <button onClick={() => setView('course')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          ← Назад към {selectedCourse.title}
        </button>
        <Card>
          <CardContent className="p-6">
            {qs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>Все още няма въпроси за този изпит.</p>
              </div>
            ) : (
              <ExamView
                course={selectedCourse}
                questions={qs}
                progress={getMyProgress(selectedCourse.id)}
                onExamComplete={handleExamComplete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: COURSE DETAIL
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'course' && selectedCourse) {
    const cls = getCourseLessons(selectedCourse.id);
    const prog = getMyProgress(selectedCourse.id);
    const done = completedLessonIds(selectedCourse.id);
    const pct = getLessonProgress(selectedCourse.id);
    const allDone = cls.length > 0 && cls.every(l => done.includes(l.id));

    return (
      <div className="space-y-4">
        <button onClick={() => setView('catalog')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          ← Към всички курсове
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline">{selectedCourse.category}</Badge>
                  <Badge className="bg-indigo-100 text-indigo-700">Level {selectedCourse.level}</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedCourse.title}</h2>
                <p className="text-slate-600 mb-4">{selectedCourse.description}</p>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Прогрес на уроците</span>
                    <span className="font-medium">{done.length}/{cls.length}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
                {prog?.exam_passed && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                    <Award className="h-4 w-4" />
                    Курсът е завършен с резултат {prog.exam_score}%
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Уроци ({cls.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {cls.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Все още няма уроци.</p>}
                {cls.map((l, i) => {
                  const isDone = done.includes(l.id);
                  const TypeIcon = l.content_type === 'video' ? Video : l.content_type === 'pdf' ? FileText : BookOpen;
                  return (
                    <button key={l.id}
                      onClick={() => { setSelectedLesson(l); setView('lesson'); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {isDone ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <TypeIcon className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{i + 1}. {l.title}</p>
                        <p className="text-xs text-slate-400">{l.duration_minutes} мин.</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                {!prog?.exam_passed && allDone && (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setView('exam')}>
                    <GraduationCap className="h-4 w-4 mr-2" /> Започни изпита
                  </Button>
                )}
                {!prog?.exam_passed && !allDone && cls.length > 0 && (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => { const first = cls.find(l => !done.includes(l.id)) || cls[0]; setSelectedLesson(first); setView('lesson'); }}>
                    <Play className="h-4 w-4 mr-2" />
                    {done.length > 0 ? 'Продължи' : 'Започни'}
                  </Button>
                )}
                {prog?.exam_passed && (
                  <Button variant="outline" className="w-full" onClick={() => setView('exam')}>
                    Повтори изпита
                  </Button>
                )}

                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t">
                  <div className="flex justify-between"><span>Уроци:</span><span>{cls.length}</span></div>
                  <div className="flex justify-between"><span>Мин. резултат:</span><span>{selectedCourse.passing_score || 80}%</span></div>
                  {prog?.exam_attempts > 0 && <div className="flex justify-between"><span>Опити:</span><span>{prog.exam_attempts}</span></div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: ADMIN
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'admin' && isAdmin) {
    const allCourses = courses;
    const userProgressMap = {};
    progress.forEach(p => {
      if (!userProgressMap[p.course_id]) userProgressMap[p.course_id] = [];
      userProgressMap[p.course_id].push(p);
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setView('catalog')} className="text-sm text-slate-500 hover:text-slate-900 mb-1 flex items-center gap-1">← Обратно към каталога</button>
            <h2 className="text-lg font-bold text-slate-900">Управление на E-Learning</h2>
          </div>
        </div>

        {/* Admin tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: 'courses', label: 'Курсове', icon: BookOpen },
            { id: 'progress', label: 'Прогрес', icon: BarChart3 },
          ].map(t => (
            <button key={t.id}
              onClick={() => setAdminTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${adminTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Courses management */}
        {adminTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                onClick={() => { setShowCourseForm(true); setEditingCourse(null); }}>
                <Plus className="h-4 w-4 mr-1" /> Нов курс
              </Button>
            </div>

            {showCourseForm && !editingCourse && (
              <CourseForm onSave={saveCourse} onCancel={() => setShowCourseForm(false)} />
            )}

            {allCourses.map(course => (
              <Card key={course.id}>
                <CardContent className="p-4 space-y-3">
                  {editingCourse?.id === course.id ? (
                    <CourseForm course={editingCourse} onSave={saveCourse} onCancel={() => setEditingCourse(null)} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                            {expandedCourse === course.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <div>
                            <span className="font-medium">{course.title}</span>
                            <div className="flex gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">Level {course.level}</Badge>
                              {course.category && <Badge variant="outline" className="text-xs">{course.category}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCourse(course)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteCourse(course.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {expandedCourse === course.id && (
                        <div className="pl-11 space-y-3 border-t pt-3">
                          {/* Lessons */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Уроци</span>
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                                onClick={() => { setShowLessonForm(course.id); setEditingLesson(null); }}>
                                <Plus className="h-3 w-3 mr-1" /> Добави
                              </Button>
                            </div>
                            {showLessonForm === course.id && !editingLesson && (
                              <LessonForm courseId={course.id} onSave={saveLesson} onCancel={() => setShowLessonForm(null)} />
                            )}
                            {getCourseLessons(course.id).map(l => (
                              <div key={l.id}>
                                {editingLesson?.id === l.id ? (
                                  <LessonForm lesson={editingLesson} courseId={course.id} onSave={saveLesson} onCancel={() => setEditingLesson(null)} />
                                ) : (
                                  <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-50">
                                    <span className="text-sm text-slate-700">{l.order}. {l.title} <span className="text-xs text-slate-400 ml-1">({l.content_type}, {l.duration_minutes}мин)</span></span>
                                    <div className="flex gap-1">
                                      <button onClick={() => setEditingLesson(l)} className="p-1 hover:text-blue-600"><Pencil className="h-3 w-3" /></button>
                                      <button onClick={() => deleteLesson(l.id)} className="p-1 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Questions */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Изпитни въпроси</span>
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                                onClick={() => { setShowQuestionForm(course.id); setEditingQuestion(null); }}>
                                <Plus className="h-3 w-3 mr-1" /> Добави
                              </Button>
                            </div>
                            {showQuestionForm === course.id && !editingQuestion && (
                              <QuestionForm courseId={course.id} onSave={saveQuestion} onCancel={() => setShowQuestionForm(null)} />
                            )}
                            {getCourseQuestions(course.id).map(q => (
                              <div key={q.id}>
                                {editingQuestion?.id === q.id ? (
                                  <QuestionForm question={editingQuestion} courseId={course.id} onSave={saveQuestion} onCancel={() => setEditingQuestion(null)} />
                                ) : (
                                  <div className="flex items-start justify-between py-1.5 px-2 rounded hover:bg-slate-50">
                                    <span className="text-sm text-slate-700 flex-1">{q.question.substring(0, 80)}… <Badge className="text-xs bg-slate-100 text-slate-600 ml-1">{q.correct_answer.toUpperCase()}</Badge></span>
                                    <div className="flex gap-1 shrink-0">
                                      <button onClick={() => setEditingQuestion(q)} className="p-1 hover:text-blue-600"><Pencil className="h-3 w-3" /></button>
                                      <button onClick={() => deleteQuestion(q.id)} className="p-1 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Progress tab */}
        {adminTab === 'progress' && (
          <div className="space-y-4">
            {courses.map(course => {
              const progs = (userProgressMap[course.id] || []);
              const passed = progs.filter(p => p.exam_passed).length;
              return (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-xs text-slate-500">{progs.length} консултанти • {passed} преминали</p>
                      </div>
                      <Badge className={passed > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                        {passed}/{progs.length}
                      </Badge>
                    </div>
                    {progs.length > 0 && (
                      <div className="space-y-1">
                        {progs.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-sm py-1 border-t border-slate-100">
                            <span className="text-slate-700">{p.user_email}</span>
                            <div className="flex items-center gap-2">
                              {p.exam_passed ? (
                                <Badge className="bg-green-100 text-green-700 text-xs">✓ {p.exam_score}%</Badge>
                              ) : p.exam_attempts > 0 ? (
                                <Badge className="bg-red-100 text-red-600 text-xs">{p.exam_score}% ({p.exam_attempts} опита)</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">{(p.lessons_completed || []).length} урока</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: CATALOG (default)
  // ════════════════════════════════════════════════════════════════════════════
  const totalLessons = lessons.length;
  const myCompletedLessons = progress
    .filter(p => p.user_email === currentUser?.email)
    .reduce((sum, p) => sum + (p.lessons_completed || []).length, 0);
  const myPassedCourses = progress.filter(p => p.user_email === currentUser?.email && p.exam_passed).length;

  const levelColors = { 1: 'from-blue-500 to-blue-600', 2: 'from-violet-500 to-violet-600', 3: 'from-amber-500 to-orange-500' };
  const levelLabels = { 1: 'Level 1 — Junior', 2: 'Level 2 — Senior', 3: 'Level 3 — Expert' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">E-Learning център</h2>
          <p className="text-slate-500 text-sm">Развивайте уменията си с обученията на Интегрити</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setView('admin')}>
              <Pencil className="h-4 w-4 mr-1" /> Управление
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Завършени курсове</p>
              <p className="text-xl font-bold">{myPassedCourses} / {courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Завършени уроци</p>
              <p className="text-xl font-bold">{myCompletedLessons}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Сертификати</p>
              <p className="text-xl font-bold">{myPassedCourses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses by level */}
      {[1, 2, 3].map(level => {
        const levelCourses = courses.filter(c => c.level === level);
        if (levelCourses.length === 0) return null;
        return (
          <div key={level}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${levelColors[level]} text-white text-sm font-medium`}>
                {levelLabels[level]}
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelCourses.map(course => {
                const status = getCourseStatus(course);
                const unlocked = isCourseUnlocked(course);
                const pct = getLessonProgress(course.id);
                const cls = getCourseLessons(course.id);
                const prog = getMyProgress(course.id);

                return (
                  <Card key={course.id} className={!unlocked ? 'opacity-50' : 'hover:shadow-md transition-shadow cursor-pointer'}
                    onClick={() => { if (unlocked) { setSelectedCourse(course); setView('course'); } }}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        {course.category && <Badge variant="outline" className="text-xs">{course.category}</Badge>}
                        {status === 'completed' && <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Завършен</Badge>}
                        {status === 'in_progress' && <Badge className="bg-blue-100 text-blue-700 text-xs"><Play className="h-3 w-3 mr-1" />В процес</Badge>}
                        {!unlocked && <Badge className="bg-slate-100 text-slate-500 text-xs"><Lock className="h-3 w-3 mr-1" />Заключен</Badge>}
                      </div>

                      <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
                      {course.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.description}</p>}

                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{cls.length} урока</span>
                        {prog?.exam_passed && <span className="text-green-600 flex items-center gap-1"><Award className="h-3 w-3" />{prog.exam_score}%</span>}
                      </div>

                      {status !== 'not_started' && (
                        <div className="space-y-1 mb-3">
                          <Progress value={pct} className="h-1.5" />
                          <p className="text-xs text-slate-400 text-right">{pct}%</p>
                        </div>
                      )}

                      {unlocked && (
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={e => { e.stopPropagation(); setSelectedCourse(course); setView('course'); }}>
                          {status === 'completed' ? 'Преглед' : status === 'in_progress' ? 'Продължи' : 'Започни'}
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                      {!unlocked && (
                        <Button size="sm" className="w-full" disabled>
                          <Lock className="h-3.5 w-3.5 mr-1" /> Завърши Level {level - 1} първо
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Все още няма курсове</p>
          {isAdmin && <p className="text-sm mt-1">Натиснете "Управление" за да добавите курсове.</p>}
        </div>
      )}
    </div>
  );
}