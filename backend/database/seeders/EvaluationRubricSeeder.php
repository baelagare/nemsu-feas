<?php

namespace Database\Seeders;

use App\Models\EvaluationCriterion;
use App\Models\EvaluationSection;
use App\Models\RatingScale;
use Illuminate\Database\Seeder;

class EvaluationRubricSeeder extends Seeder
{
    /**
     * Seed official Student Evaluation of Teachers (SET) rubric and criteria.
     */
    public function run(): void
    {
        // 1. Rating Scales (5-point Likert scale)
        $scales = [
            [
                'score' => 5,
                'label' => 'Always manifested',
                'description' => 'Evident in nearly all relevant situations (91-100% of instances).',
                'display_order' => 1,
            ],
            [
                'score' => 4,
                'label' => 'Often manifested',
                'description' => 'Evident most of the time, with occasional lapses (61-90%).',
                'display_order' => 2,
            ],
            [
                'score' => 3,
                'label' => 'Sometimes manifested',
                'description' => 'Evident about half of the time (31-60%).',
                'display_order' => 3,
            ],
            [
                'score' => 2,
                'label' => 'Seldom manifested',
                'description' => 'Infrequently demonstrated: rarely evident in relevant situations (11-30%).',
                'display_order' => 4,
            ],
            [
                'score' => 1,
                'label' => 'Never/Rarely manifested',
                'description' => 'Seldom demonstrated: almost never evident, with only isolated cases (0-10%).',
                'display_order' => 5,
            ],
        ];

        foreach ($scales as $scale) {
            RatingScale::updateOrCreate(['score' => $scale['score']], $scale);
        }

        // 2. Evaluation Sections & 15 Criteria Items
        $sections = [
            [
                'code' => 'A',
                'title' => 'A. Management of Teaching and Learning',
                'description' => 'Rate each statement from 5 (always manifested) to 1 (never/rarely manifested).',
                'display_order' => 1,
                'criteria' => [
                    ['item_code' => 'a1', 'criterion_text' => 'Comes to class on time.', 'display_order' => 1],
                    ['item_code' => 'a2', 'criterion_text' => 'Explains learning outcomes, expectations, grading system, and various requirements of the subject/course.', 'display_order' => 2],
                    ['item_code' => 'a3', 'criterion_text' => 'Maximizes the allocated time/learning hours effectively.', 'display_order' => 3],
                    ['item_code' => 'a4', 'criterion_text' => 'Facilitates students to think critically and creatively by providing appropriate learning activities.', 'display_order' => 4],
                    ['item_code' => 'a5', 'criterion_text' => 'Guides students to learn on their own, reflect on new ideas and experiences, and make decisions in accomplishing given tasks.', 'display_order' => 5],
                    ['item_code' => 'a6', 'criterion_text' => 'Communicates constructive feedback to students for their academic growth.', 'display_order' => 6],
                ],
            ],
            [
                'code' => 'B',
                'title' => 'B. Content, Knowledge, Pedagogy and Technology',
                'description' => 'Rate each statement from 5 (always manifested) to 1 (never/rarely manifested).',
                'display_order' => 2,
                'criteria' => [
                    ['item_code' => 'b1', 'criterion_text' => 'Demonstrates extensive and broad knowledge of the subject/course.', 'display_order' => 1],
                    ['item_code' => 'b2', 'criterion_text' => 'Simplifies complex ideas in the lesson for ease of understanding.', 'display_order' => 2],
                    ['item_code' => 'b3', 'criterion_text' => 'Relates the subject matter to contemporary issues and developments in the discipline and/or daily life activities.', 'display_order' => 3],
                    ['item_code' => 'b4', 'criterion_text' => 'Promotes active learning and student engagement by using appropriate teaching and learning resources including ICT tools and platforms.', 'display_order' => 4],
                    ['item_code' => 'b5', 'criterion_text' => 'Uses appropriate assessments (projects, exams, quizzes, assignments, etc.) aligned with the learning outcomes.', 'display_order' => 5],
                ],
            ],
            [
                'code' => 'C',
                'title' => 'C. Commitment and Transparency',
                'description' => 'Rate each statement from 5 (always manifested) to 1 (never/rarely manifested).',
                'display_order' => 3,
                'criteria' => [
                    ['item_code' => 'c1', 'criterion_text' => 'Recognizes and values the unique diversity and individual differences among students.', 'display_order' => 1],
                    ['item_code' => 'c2', 'criterion_text' => 'Assists students with their learning challenges during consultation hours.', 'display_order' => 2],
                    ['item_code' => 'c3', 'criterion_text' => 'Provides immediate feedback on students outputs and performance.', 'display_order' => 3],
                    ['item_code' => 'c4', 'criterion_text' => 'Provides transparent and clear criteria in rating student’s performance.', 'display_order' => 4],
                ],
            ],
        ];

        foreach ($sections as $secData) {
            $criteria = $secData['criteria'];
            unset($secData['criteria']);

            $section = EvaluationSection::updateOrCreate(['code' => $secData['code']], $secData);

            foreach ($criteria as $crit) {
                EvaluationCriterion::updateOrCreate(
                    ['item_code' => $crit['item_code']],
                    array_merge($crit, [
                        'section_id' => $section->id,
                        'is_active' => true,
                    ])
                );
            }
        }
    }
}
