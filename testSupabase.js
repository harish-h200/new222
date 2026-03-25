import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchDb() {
    const { data: goals, error: gError } = await supabase.from('goals').select('*');
    console.log('Goals:', goals, gError);

    const { data: courses, error: cError } = await supabase.from('courses').select('*');
    console.log('Courses:', courses, cError);

    const { data: prereqs, error: pError } = await supabase.from('course_prerequisites').select('*');
    console.log('Prerequisites:', prereqs, pError);

    const { data: roadmaps, error: rError } = await supabase.from('roadmaps').select('*');
    console.log('Roadmaps:', roadmaps, rError);

    const { data: nodes, error: nError } = await supabase.from('roadmap_nodes').select('*');
    console.log('Roadmap Nodes:', nodes, nError);

    const { data: edges, error: eError } = await supabase.from('roadmap_edges').select('*');
    console.log('Roadmap Edges:', edges, eError);
}

fetchDb();
