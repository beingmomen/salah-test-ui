import { useApiRequest } from "./useApiRequest";
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'

const allData = ref({})
const jobs = ref([])

export const useGlobalData = () =>  {

    const route = useRoute()
    const router = useRouter()

    console.warn('router', route.query);

    const searchQuery = ref(route.query.search || '')
    const debouncedSearch = ref(searchQuery.value)

    watch(searchQuery, (newValue) => {
        debouncedSearch.value = newValue
    }, { immediate: true })

    // Debounced watcher to update filters
    watch(debouncedSearch, (newValue) => {
        updateFilters()
    }, { debounce: 300 })

    const selectAllDepartments = ref(false)
    const selectAllLocations = ref(false)
    const selectAllLevels = ref(false)

    // Helper function to handle both string and array query params
    const parseQueryParam = (param) => {
        if (!param) return []
        // Handle comma-separated string values
        if (typeof param === 'string') {
            return param.split(',').map(String)
        }
        // Handle array values
        return Array.isArray(param) ? param.map(String) : [String(param)]
    }

    const selectedDepartments = ref(parseQueryParam(route.query.department))
    const selectedLocations = ref(parseQueryParam(route.query.location))
    const selectedLevels = ref(parseQueryParam(route.query.level))


    const updateFilters = () => {
        const query = {}
        
        if (debouncedSearch.value) {
            query.search = debouncedSearch.value
        }
        
        if (selectedDepartments.value.length) {
            query.department = selectedDepartments.value.join(',')
        }
        
        if (selectedLocations.value.length) {
            query.location = selectedLocations.value.join(',')
        }
        
        if (selectedLevels.value.length) {
            query.level = selectedLevels.value.join(',')
        }
        
        router.push({ query })

        fetchAllJobs()
    }

    const toggleAllDepartments = () => {
        if (selectAllDepartments.value) {
            selectedDepartments.value = allData.value.departments?.map(dept => String(dept.documentNumber)) || []
        } else {
            selectedDepartments.value = []
        }
        updateFilters()
    }

    const toggleAllLocations = () => {
        if (selectAllLocations.value) {
            selectedLocations.value = allData.value.locations?.map(loc => String(loc.documentNumber)) || []
        } else {
            selectedLocations.value = []
        }
        updateFilters()
    }

    const toggleAllLevels = () => {
        if (selectAllLevels.value) {
            selectedLevels.value = allData.value.levels?.map(level => String(level.documentNumber)) || []
        } else {
            selectedLevels.value = []
        }
        updateFilters()
    }
    const { get } = useApiRequest();

    const fetchGlobalData = async () => {
        const [departments, locations, levels] = await Promise.all([
            get('/departments/all'), 
            get('/locations/all'), 
            get('/levels/all')
        ])
    
        allData.value = {
            departments,
            locations,
            levels
        }
    }

    const fetchAllJobs = async () => {
        const params = {};
        
        if (debouncedSearch.value) params.search = debouncedSearch.value;
        if (selectedDepartments.value.length) params.department = selectedDepartments.value.join(',');
        if (selectedLocations.value.length) params.location = selectedLocations.value.join(',');
        if (selectedLevels.value.length) params.level = selectedLevels.value.join(',');
        
        params.limit = 5;
        
        const options = { params };
        const {data} = await get('/jobs', options);
        jobs.value = data;
        return data;
    }

    return {
        fetchGlobalData,
        allData,
        jobs,
        fetchAllJobs,
        searchQuery,
        selectAllDepartments,
        selectAllLocations,
        selectAllLevels,
        selectedDepartments,
        selectedLocations,
        selectedLevels,
        updateFilters,
        toggleAllDepartments,
        toggleAllLocations,
        toggleAllLevels
    }
}